const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'ap-south-1' });

// Send reservation confirmation notification
exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event));

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { name, phone, date, time, guests, requests } = body;

        console.log('Parsed reservation data:', { name, phone, date, time, guests });

        // Validate required fields
        if (!name || !phone || !date || !time || !guests) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Missing required fields'
                })
            };
        }

        // Format the date and time
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        console.log('Formatted date:', formattedDate);

        let emailSent = false;
        let emailError = null;

        // Send email notification to restaurant
        try {
            const emailParams = {
                Source: process.env.EMAIL_USER,
                Destination: {
                    ToAddresses: [process.env.EMAIL_USER]
                },
                Message: {
                    Subject: {
                        Data: `🔔 New Reservation - ${name} for ${formattedDate}`
                    },
                    Body: {
                        Html: {
                            Data: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
                                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                                        <h1 style="color: white; margin: 0;">🍽️ New Table Reservation</h1>
                                    </div>
                                    
                                    <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                        <h2 style="color: #333; margin-top: 0;">Reservation Details</h2>
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr style="border-bottom: 1px solid #eee;">
                                                <td style="padding: 12px 0; font-weight: bold; color: #666;">👤 Name:</td>
                                                <td style="padding: 12px 0; color: #333; font-size: 16px; font-weight: bold;">${name}</td>
                                            </tr>
                                            <tr style="border-bottom: 1px solid #eee;">
                                                <td style="padding: 12px 0; font-weight: bold; color: #666;">📱 Phone:</td>
                                                <td style="padding: 12px 0; color: #333; font-size: 18px; font-weight: bold;">${phone}</td>
                                            </tr>
                                            <tr style="border-bottom: 1px solid #eee;">
                                                <td style="padding: 12px 0; font-weight: bold; color: #666;">📅 Date:</td>
                                                <td style="padding: 12px 0; color: #333; font-size: 16px;">${formattedDate}</td>
                                            </tr>
                                            <tr style="border-bottom: 1px solid #eee;">
                                                <td style="padding: 12px 0; font-weight: bold; color: #666;">⏰ Time:</td>
                                                <td style="padding: 12px 0; color: #333; font-size: 18px; font-weight: bold;">${time}</td>
                                            </tr>
                                            <tr style="border-bottom: 1px solid #eee;">
                                                <td style="padding: 12px 0; font-weight: bold; color: #666;">👥 Guests:</td>
                                                <td style="padding: 12px 0; color: #333; font-size: 16px;">${guests} ${guests === '1' ? 'person' : 'people'}</td>
                                            </tr>
                                            ${requests ? `
                                            <tr>
                                                <td style="padding: 12px 0; font-weight: bold; color: #666; vertical-align: top;">📝 Special Requests:</td>
                                                <td style="padding: 12px 0; color: #333;">${requests}</td>
                                            </tr>
                                            ` : ''}
                                        </table>
                                        
                                        <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin-top: 25px; border-radius: 5px;">
                                            <p style="margin: 0; color: #155724; font-size: 14px;">
                                                <strong>✅ ACTION REQUIRED:</strong><br>
                                                Please call <strong>${phone}</strong> to confirm this reservation.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                                        <p>Automated notification from Spice & Soul Reservation System</p>
                                        <p>📍 Near College Square, Bhawanipatna | 📞 +91 98765 43210</p>
                                    </div>
                                </div>
                            `
                        }
                    }
                }
            };

            const result = await ses.sendEmail(emailParams).promise();
            console.log('Email sent successfully:', result.MessageId);
            emailSent = true;

        } catch (error) {
            console.error('Email sending failed:', error);
            emailError = error.message;
            
            // Log reservation details for manual followup
            console.log('===== RESERVATION DETAILS (Manual Followup Required) =====');
            console.log(`Customer: ${name}`);
            console.log(`Phone: ${phone}`);
            console.log(`Date: ${formattedDate}`);
            console.log(`Time: ${time}`);
            console.log(`Guests: ${guests}`);
            console.log(`Requests: ${requests || 'None'}`);
            console.log('=========================================================');
        }

        // Return success response
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                message: emailSent 
                    ? 'Reservation confirmed! We will call you shortly to confirm.' 
                    : 'Reservation confirmed! We will contact you soon.',
                emailSent: emailSent,
                emailError: emailError,
                data: {
                    name,
                    phone,
                    date: formattedDate,
                    time,
                    guests
                }
            })
        };

    } catch (error) {
        console.error('Error processing reservation:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                success: false,
                message: 'Failed to process reservation',
                error: error.message
            })
        };
    }
};
