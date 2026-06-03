export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    nome, idade, email, instagram, whatsapp, renda, fatura_digital,
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
          'Name': {
            title: [{ text: { content: nome || 'Lead sem nome' } }]
          }
        },
        children: [
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ text: { content: `📋 Aplicação de ${nome}` } }]
            }
          },
          {
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ text: { content: `👤 Nome: ${nome}` } }]
            }
          },
          {
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ text: { content: `🎂 Idade: ${idade}` } }]
            }
          },
          {
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ text: { content: `📧 Email: ${email}` } }]
            }
          },
          {
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ text: { content: `📸 Instagram: ${instagram || 'Não informado'}` } }]
            }
          },
          {
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ text: { content: `📱 WhatsApp: ${whatsapp}` } }]
            }
          },
          {
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ text: { content: `💰 Renda Mensal: ${renda}` } }]
            }
          },
          {
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ text: { content: `💻 Fatura no Digital: ${fatura_digital}` } }]
            }
          },
          {
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ text: { content: `🏢 Modelo de Negócio: ${modelo_negocio || 'Não informado'}` } }]
            }
          },
          {
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ text: { content: `📣 Como me descobriu: ${como_descobriu}` } }]
            }
          },
          {
            object: 'block',
            type: 'heading_3',
            heading_3: {
              rich_text: [{ text: { content: '🎯 Objetivo com a Mentoria' } }]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: objetivo } }]
            }
          },
          {
            object: 'block',
            type: 'heading_3',
            heading_3: {
              rich_text: [{ text: { content: '⚡ Maior Desafio Hoje' } }]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: desafio } }]
            }
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Notion error:', JSON.stringify(data));
      return res.status(500).json({ error: 'Erro ao salvar no Notion', details: data });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
