// src/components/NewLeadEmail.tsx

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
} from '@react-email/components';
import * as React from 'react';

interface NewLeadEmailProps {
  name: string;
  phone: string;
  email: string;
  projectDraft: string;
}

export const NewLeadEmail = ({
  name,
  phone,
  email,
  projectDraft,
}: NewLeadEmailProps) => (
  <Html>
    <Head />
    <Preview>Nova Proposta de Projeto Recebida via Site!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>🚀 Novo Lead da CodeVibe Studio!</Heading>
        <Text style={paragraph}>Você recebeu uma nova proposta de projeto através do Gerador de Ideias do site.</Text>
        
        <Section style={section}>
          <Heading as="h2" style={subheading}>Dados do Cliente</Heading>
          <Text style={text}><strong>Nome:</strong> {name}</Text>
          <Text style={text}><strong>E-mail:</strong> {email}</Text>
          <Text style={text}><strong>Telefone:</strong> {phone}</Text>
        </Section>

        <Section style={section}>
            <Heading as="h2" style={subheading}>Esboço do Projeto Gerado pela IA</Heading>
            <Text style={draftBox}>{projectDraft}</Text>
        </Section>
        
        <Text style={footer}>Este e-mail foi enviado automaticamente pelo site da CodeVibe Studio.</Text>
      </Container>
    </Body>
  </Html>
);

// Estilos para o e-mail
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const heading = {
  color: '#0D47A1',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
};

const subheading = {
    color: '#F57C00',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '20px 0 10px 0',
}

const section = {
    padding: '0 24px',
}

const text = {
  color: '#3c4043',
  fontSize: '16px',
  lineHeight: '24px',
};

const paragraph = {
    ...text,
    textAlign: 'center' as const,
}

const draftBox = {
    ...text,
    backgroundColor: '#f2f3f3',
    padding: '16px',
    borderRadius: '8px',
    whiteSpace: 'pre-wrap' as const,
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '20px',
};
