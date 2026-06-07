export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    nome, idade, email, instagram, whatsapp, renda, fatura_digital,
    modelo_negocio, como_descobriu, objetivo, desafio
  } = req.body;

  if (!nome || !idade || !email || !whatsapp || !renda || !fatura_digital || !como_descobriu || !objetivo || !desafio) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];

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
            number: parseInt(idade) || 0
          },
          'Email': {
            email: email || ''
          },
          'Instagram': {
            rich_text: [{ text: { content: instagram || '' } }]
          },
          'WhatsApp': {
            phone_number: whatsapp || ''
          },
          'Renda Mensal': {
            select: { name: renda || '' }
          },
          'Fatura Digital': {
            select: { name: fatura_digital || '' }
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
            select: { name: como_descobriu || '' }
          },
          'Status': {
            select: { name: 'Novo' }
          },
          'Data': {
            date: { start: today }
          },
          'Formulário': {
            rich_text: [{ text: { content: 'Mentoria Individual' } }]
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Notion error:', data);
      return res.status(500).json({ error: 'Erro ao salvar no Notion', details: data });
    }

    // Envia notificação no WhatsApp do Felipe
    const waBody = {
      number: '5512992051066',
      options: { delay: 1000, presence: 'composing' },
      text: `🔔 *Novo Lead - Mentoria Individual*\n\n*Nome:* ${nome}\n*Idade:* ${idade}\n*WhatsApp:* ${whatsapp}\n*Email:* ${email}\n*Renda:* ${renda}\n*Fatura Digital:* ${fatura_digital}\n*Como descobriu:* ${como_descobriu}\n\n*Objetivo:* ${objetivo.substring(0, 150)}${objetivo.length > 150 ? '...' : ''}\n*Desafio:* ${desafio.substring(0, 150)}${desafio.length > 150 ? '...' : ''}`
    };

    try {
      await fetch(
        `https://felipe-evolution-api.gno9t9.easypanel.host/message/sendText/${process.env.EVOLUTION_INSTANCE}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.EVOLUTION_API_KEY
          },
          body: JSON.stringify(waBody)
        }
      );
    } catch (waError) {
      console.error('WhatsApp notify error:', waError);
      // não quebra o fluxo se o zap falhar
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}