export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    nome, idade, whatsapp, renda, fatura_digital,
    modelo_negocio, objetivo, desafio, como_descobriu
  } = req.body;

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_ID },
        properties: {
          'Nome': {
            title: [{ text: { content: nome || '' } }]
          },
          'Idade': {
            rich_text: [{ text: { content: idade || '' } }]
          },
          'WhatsApp': {
            rich_text: [{ text: { content: whatsapp || '' } }]
          },
          'Renda Mensal': {
            rich_text: [{ text: { content: renda || '' } }]
          },
          'Fatura no Digital': {
            rich_text: [{ text: { content: fatura_digital || '' } }]
          },
          'Modelo de Negócio': {
            rich_text: [{ text: { content: modelo_negocio || '' } }]
          },
          'Objetivo': {
            rich_text: [{ text: { content: objetivo || '' } }]
          },
          'Maior Desafio': {
            rich_text: [{ text: { content: desafio || '' } }]
          },
          'Como Descobriu': {
            rich_text: [{ text: { content: como_descobriu || '' } }]
          },
          'Status': {
            rich_text: [{ text: { content: 'Novo Lead' } }]
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Notion error:', data);
      return res.status(500).json({ error: 'Erro ao salvar no Notion', details: data });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
