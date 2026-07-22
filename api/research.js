const CROSSREF_URL = 'https://api.crossref.org/works';

module.exports = async function handler(_request, response) {
  const params = new URLSearchParams({
    query: 'resistance training exercise nutrition muscle hypertrophy fitness',
    filter: 'from-pub-date:2022,type:journal-article',
    sort: 'published',
    order: 'desc',
    rows: '6',
    mailto: 'support@wolverinestack.app',
  });

  try {
    const crossrefResponse = await fetch(`${CROSSREF_URL}?${params}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'WolverineStack/1.0 (mailto:support@wolverinestack.app)',
      },
    });

    if (!crossrefResponse.ok) {
      throw new Error(`Crossref responded with ${crossrefResponse.status}`);
    }

    const payload = await crossrefResponse.json();
    response.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');
    response.status(200).json(payload);
  } catch (error) {
    console.error('Research feed request failed', error);
    response.status(502).json({ message: 'Research feed is temporarily unavailable' });
  }
};
