// lib/email-templates.ts

export function getTeacherInviteEmail(data: {
  teacherName: string;
  schoolName: string;
  inviteCode: string;
  inviteUrl: string;
  expiresAt: Date;
}) {
  const { teacherName, schoolName, inviteCode, inviteUrl, expiresAt } = data;
  
  const expiryDate = new Date(expiresAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    subject: `You've been invited to join ${schoolName} on KlassMata`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Teacher Invitation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 0; text-align: center; background-color: #024731;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">KlassMata</h1>
                <p style="color: #D4AF37; margin: 5px 0 0 0; font-size: 14px;">School Management System</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #024731; margin: 0 0 20px 0; font-size: 24px;">Welcome to the Team!</h2>
                      
                      <p style="color: #333333; line-height: 1.6; margin: 0 0 20px 0;">
                        Hi <strong>${teacherName}</strong>,
                      </p>
                      
                      <p style="color: #333333; line-height: 1.6; margin: 0 0 20px 0;">
                        You've been invited to join <strong>${schoolName}</strong> as a teacher on KlassMata, 
                        our comprehensive school management platform.
                      </p>
                      
                      <div style="background-color: #f8f9fa; border-left: 4px solid #024731; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Your invite code:</p>
                        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #024731; font-family: monospace; letter-spacing: 2px;">
                          ${inviteCode}
                        </p>
                      </div>
                      
                      <p style="color: #333333; line-height: 1.6; margin: 20px 0;">
                        Click the button below to complete your registration:
                      </p>
                      
                      <table role="presentation" style="margin: 30px 0;">
                        <tr>
                          <td style="border-radius: 4px; background-color: #024731;">
                            <a href="${inviteUrl}" 
                               style="display: inline-block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 4px;">
                              Complete Registration
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${inviteUrl}" style="color: #024731; word-break: break-all;">${inviteUrl}</a>
                      </p>
                      
                      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0;">
                          <strong>Note:</strong> This invitation expires on <strong>${expiryDate}</strong>.
                          If you did not expect this invitation, please ignore this email.
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #f5f5f5;">
                <p style="color: #999999; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} KlassMata. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
Welcome to ${schoolName}!

Hi ${teacherName},

You've been invited to join ${schoolName} as a teacher on KlassMata.

Your invite code: ${inviteCode}

Complete your registration by visiting:
${inviteUrl}

This invitation expires on ${expiryDate}.

If you did not expect this invitation, please ignore this email.

© ${new Date().getFullYear()} KlassMata
    `.trim(),
  };
}