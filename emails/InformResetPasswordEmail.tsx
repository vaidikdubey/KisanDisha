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

interface PasswordChangedEmailProps {
  name: string;
  updatedAt?: string;
  supportLink?: string;
}

export default function PasswordChangedEmail({
  name,
  updatedAt,
  supportLink = 'https://kisandisha.com/support',
}: PasswordChangedEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Password Changed Successfully</title>
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
      <Preview>Your KisanDisha account password has been updated</Preview>
      <Section>
        <Row>
          <Heading as="h2">Hello {name},</Heading>
        </Row>
        <Row>
          <Text>
            This is a confirmation that the password for your KisanDisha account was recently changed
            {updatedAt ? ` on ${updatedAt}` : ''}.
          </Text>
        </Row>
        <Row>
          <Text style={{ marginTop: '10px', marginBottom: '20px' }}>
            If you made this change, you can safely ignore this email—no further action is needed.
          </Text>
        </Row>
        <Row>
          <Text style={{ fontWeight: 'bold', color: '#d93025' }}>
            Did you not make this change?
          </Text>
        </Row>
        <Row>
          <Text>
            If you did not change your password, your account may have been compromised. Please secure your account or reach out to our support team immediately:
          </Text>
        </Row>
        <Row>
          <Button
            href={supportLink}
            style={{
              backgroundColor: '#d93025',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '5px',
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: 'bold',
              marginTop: '10px',
            }}
          >
            Contact Support & Secure Account
          </Button>
        </Row>
      </Section>
    </Html>
  );
}