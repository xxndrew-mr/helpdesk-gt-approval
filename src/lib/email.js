import nodemailer from 'nodemailer';
import { emailTemplate } from './email-template';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT == "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendTicketAssignedEmail({ to, subject, ticket, extraText }) {
  if (!to) return;

  const message = `
  Anda menerima permintaan baru pada sistem Helpdesk.<br/><br/>

  <p style="margin:0 0 10px;">Berikut detail permintaan:</p>

  <table style="
      width:100%;
      border-collapse:collapse;
      font-size:14px;
  ">
      <tr>
          <td style="padding:8px 0; color:#555; width:140px;"><b>Kategori</b></td>
          <td style="padding:8px 0; color:#333;">${ticket.kategori}</td>
      </tr>
      <tr>
          <td style="padding:8px 0; color:#555;"><b>Sub Kategori</b></td>
          <td style="padding:8px 0; color:#333;">${ticket.sub_kategori}</td>
      </tr>
      <tr>
          <td style="padding:8px 0; color:#555;"><b>Status</b></td>
          <td style="padding:8px 0; color:#333;">${ticket.status}</td>
      </tr>
      <tr>
          <td style="padding:8px 0; color:#555;"><b>Tipe Layanan</b></td>
          <td style="padding:8px 0; color:#333;">${ticket.type}</td>
      </tr>
  </table>

  ${
    extraText
      ? `<p style="margin-top:15px;">${extraText}</p>`
      : ""
  }

  <p style="margin-top:18px;">
    Harap segera dilakukan pengecekan dan tindak lanjut sesuai prosedur.
  </p>
`;


  const html = emailTemplate({
    title: "Helpdesk-GT",
    subtitle: subject,
    message,
    ticketId: ticket.ticket_id,
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log("Email sent to:", to);
  } catch (err) {
    console.error("Email failed to send:", err);
  }
}
