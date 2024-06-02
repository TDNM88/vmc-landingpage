const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  const { email } = req.body;
  if (!email || !validateEmail(email)) {
    return res.status(400).send({ message: 'Invalid email' });
  }

  // Kết nối cơ sở dữ liệu và lưu email vào cơ sở dữ liệu ở đây
  // Ví dụ này chỉ gửi email mà không lưu vào cơ sở dữ liệu

  // Thiết lập cấu hình cho email
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Xác nhận đăng ký của bạn',
    text: 'Cảm ơn bạn đã đăng ký nhận thông tin từ VMC!'
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Failed to send email', error });
  }
};

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}
