// lib/email.ts
import { Resend } from 'resend';
import { getTeacherInviteEmail } from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTeacherInvite(data: {
  email: string;
  firstName: string;
  lastName: string;
  schoolName: string;
  inviteCode: string;
  expiresAt: Date;
}) {
  const { email, firstName, lastName, schoolName, inviteCode, expiresAt } = data;
  
  const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/onboard?code=${inviteCode}`;
  
  const emailContent = getTeacherInviteEmail({
    teacherName: `${firstName} ${lastName}`,
    schoolName,
    inviteCode,
    inviteUrl,
    expiresAt,
  });

  try {
    const result = await resend.emails.send({
      from: 'KlassMata <onboarding@resend.dev>', // Use your verified domain later
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log('Email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}