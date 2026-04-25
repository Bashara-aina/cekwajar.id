import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  attachments?: { filename: string; content: Buffer | string }[];
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { to, subject, html, from = 'cekwajar <noreply@cekwajar.id>', attachments } = options;

    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
      attachments,
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    return { success: true, id: response.data?.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Email templates
export const emailTemplates = {
  paymentConfirmation: (data: {
    userName: string;
    amount: string;
    plan: string;
    transactionId: string;
    paymentDate: string;
  }) => ({
    subject: `Pembayaran Berhasil - ${data.plan}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Pembayaran Diterima!</h1>
        <p>Hi ${data.userName},</p>
        <p>Pembayaran kamu telah kami terima:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Plan</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${data.plan}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Jumlah</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${data.amount}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">ID Transaksi</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.transactionId}</td>
          </tr>
          <tr>
            <td style="padding: 8px;">Tanggal</td>
            <td style="padding: 8px;">${data.paymentDate}</td>
          </tr>
        </table>
        <p>Kamu sekarang bisa menikmati fitur premium cekwajar.id!</p>
      </div>
    `,
  }),

  receiptPDF: (data: {
    userName: string;
    email: string;
    amount: string;
    plan: string;
    transactionId: string;
    pdfBuffer: Buffer;
  }) => ({
    subject: `Kwitansi Pembayaran - ${data.plan}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Kwitansi Pembayaran</h1>
        <p>Hi ${data.userName},</p>
        <p>Terlampir kwitansi untuk pembayaran ${data.plan} sebesar ${data.amount}.</p>
        <p>Invoice ID: ${data.transactionId}</p>
      </div>
    `,
    attachments: [
      {
        filename: `kwitansi-${data.transactionId}.pdf`,
        content: data.pdfBuffer,
      },
    ],
  }),
};

export default resend;
