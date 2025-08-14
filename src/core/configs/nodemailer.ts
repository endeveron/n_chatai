export const nodemailerUser = process.env.NODEMAILER_USER;
export const nodemailerPassword = process.env.NODEMAILER_PASSWORD;

export const gmailTransportConfig = {
  service: 'gmail',
  auth: {
    user: nodemailerUser,
    pass: nodemailerPassword,
  },
};
