export default async function handler(req, res) {
  try {
    const { city, lat, lon } = req.query;

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API_KEY não configurada" });
    }

    let url = "";

    if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=pt_br&appid=${apiKey}`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${apiKey}`;
    } else {
      return res.status(400).json({ error: "Parâmetros inválidos" });
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      return res.status(400).json({
        message: data.message || "Erro ao buscar dados",
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Erro no servidor:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}