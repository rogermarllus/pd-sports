export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método não permitido',
    });
  }

  try {
    const { zipCode } = req.body;

    const cleanZipCode = zipCode?.replace(/\D/g, '');

    if (!cleanZipCode || cleanZipCode.length !== 8) {
      return res.status(400).json({
        error: 'CEP inválido',
      });
    }

    const response = await fetch('https://www.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          postal_code: '34006065',
        },
        to: {
          postal_code: cleanZipCode,
        },
        package: {
          width: 20,
          height: 5,
          length: 30,
          weight: 0.5,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao calcular frete:', error);

    return res.status(500).json({
      error: 'Erro interno ao calcular frete',
    });
  }
}
