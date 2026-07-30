export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nome, email, whatsapp } = req.body;

  if (!nome || !email || !whatsapp) {
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
        parent: { database_id: process.env.NOTION_ISCA_DB_ID },
        properties: {
          'Nome': {
            title: [{ text: { content: nome || '' } }]
          },
          'Email': {
            email: email || ''
          },
          'WhatsApp': {
            phone_number: whatsapp || ''
          },
          'Status': {
            select: { name: 'Novo' }
          },
          'Data': {
            date: { start: today }
          },
          'Formulário': {
            rich_text: [{ text: { content: 'Isca Checklist' } }]
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Notion error:', data);
      return res.status(500).json({ error: 'Erro ao salvar no Notion', details: data });
    }

    const waBody = {
      number: '5512992051066',
      options: { delay: 1000, presence: 'composing' },
      text: `🔔 *Novo Lead - Checklist Grátis*\n\n*Nome:* ${nome}\n*Email:* ${email}\n*WhatsApp:* ${whatsapp}`
    };

    try {
      const waRes = await fetch(
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
      const waResBody = await waRes.text();
      if (!waRes.ok) {
        console.error('WhatsApp notify failed:', waRes.status, waResBody);
      } else {
        console.log('WhatsApp notify sent:', waRes.status, waResBody);
      }
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
