import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface TicketEmailData {
  to: string;
  ticketNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  businessName: string;
  branchName: string;
  date: string;
}

export async function sendTicketEmail(data: TicketEmailData) {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        ${item.name}
        ${item.notes ? `<br><small style="color: #666;">${item.notes}</small>` : ''}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ticket #${data.ticketNumber}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #D17A4F 0%, #F5B041 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🧾 Ticket de Compra</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">Ticket #${data.ticketNumber}</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee; border-top: none;">
        <div style="margin-bottom: 20px;">
          <h2 style="color: #D17A4F; margin: 0 0 10px 0; font-size: 20px;">${data.businessName}</h2>
          <p style="margin: 0; color: #666;">${data.branchName}</p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${data.date}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 5px; overflow: hidden;">
          <thead>
            <tr style="background: #D17A4F; color: white;">
              <th style="padding: 12px; text-align: left;">Producto</th>
              <th style="padding: 12px; text-align: center;">Cant.</th>
              <th style="padding: 12px; text-align: right;">Precio</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 5px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span style="color: #666;">Subtotal:</span>
            <span style="font-weight: bold;">$${data.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 20px;">
            <span style="font-weight: bold; color: #D17A4F;">Total:</span>
            <span style="font-weight: bold; color: #D17A4F;">$${data.total.toFixed(2)}</span>
          </div>
        </div>

        <div style="margin-top: 15px; padding: 15px; background: #FFF4E6; border-radius: 5px; border-left: 4px solid #F5B041;">
          <p style="margin: 0; color: #C87A2F;">
            <strong>✓ Pagado</strong> - ${data.paymentMethod === 'cash' ? 'Efectivo' : data.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">¡Gracias por su compra!</p>
          <p style="margin: 10px 0 0 0;">Este es un comprobante electrónico de su ticket.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
TICKET #${data.ticketNumber}
${data.businessName}
${data.branchName}
${data.date}

PRODUCTOS:
${data.items.map(item => 
  `${item.name} x${item.quantity} - $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}${item.notes ? `\n  Nota: ${item.notes}` : ''}`
).join('\n')}

Subtotal: $${data.subtotal.toFixed(2)}
TOTAL: $${data.total.toFixed(2)}

Método de pago: ${data.paymentMethod === 'cash' ? 'Efectivo' : data.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}

¡Gracias por su compra!
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${data.businessName}" <ticket-noreply@nuvly.mx>`,
      to: data.to,
      subject: `Ticket #${data.ticketNumber} - ${data.businessName}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
