import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
} from 'react-email';

interface ResetPasswordEmailProps {
  name: string;
  resetLink: string;
}

export default function ResetPasswordEmail({ name, resetLink }: ResetPasswordEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Reset Your Password</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Request to reset your KisanDisha password</Preview>
      <Section>
        <Row>
          <Heading as="h2">Hello {name},</Heading>
        </Row>
        <Row>
          <Text>
            We received a request to reset the password for your KisanDisha account.
            Click the button below to set up a new password:
          </Text>
        </Row>
        <Row>
          <Button
            href={resetLink}
            style={{
              backgroundColor: '#0070f3',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '5px',
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: 'bold',
            }}
          >
            Reset Password
          </Button>
        </Row>
        <Row>
          <Text style={{ marginTop: '20px' }}>
            If you did not request a password reset, you can safely ignore this email.
            Your password will remain unchanged.
          </Text>
        </Row>
      </Section>
    </Html>
  );
}