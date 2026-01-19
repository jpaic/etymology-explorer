import React, { useState, useEffect } from 'react';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWord, setSelectedWord] = useState(null);
  const [activeHistoryItem, setActiveHistoryItem] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [highlightedCountries, setHighlightedCountries] = useState({});

  // Historical maps based on time periods
  const historicalMaps = React.useMemo(() => ({
  'modern': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1994.geojson',
  '1530': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1530.geojson',
  '1200': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1200.geojson',
  '1000': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1000.geojson',
  '700': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_700.geojson',
  '1': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_bc1.geojson',
  '-500': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_bc500.geojson',
  '-700': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_bc700.geojson',
  '-1000': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_bc1000.geojson',
  '-2000': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_bc2000.geojson',
  '-3000': 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_bc3000.geojson'
}), []);


  const languageColors = {
    'Old English': '#8b7355',
    'Middle English': '#9b8365',
    'Anglo-Norman': '#4b0082',
    'Proto-Germanic': '#6b8e23',
    'Proto-West Germanic': '#7b9e33',
    'Proto-Indo-European': '#8b6914',
    'Latin': '#9370db',
    'Classical Latin': '#8360cb',
    'Vulgar Latin': '#a380eb',
    'Old French': '#4169e1',
    'Gaulish': '#662fcd',
    'Middle French': '#5179f1',
    'Greek': '#cd853f',
    'Ancient Greek': '#dd954f',
    'Old Norse': '#2e8b57',
    'Proto-Slavic': '#dc143c',
    'Sanskrit': '#ff8c00',
    'Arabic': '#228b22',
    'Persian': '#8b008b',
    'Old Irish': '#00ced1',
    'Old High German': '#556b2f',
    'Proto-Celtic': '#4682b4',
    'Proto-Italic': '#ba55d3',
    'Proto-Balto-Slavic': '#b22222',
    'Old Saxon': '#5f9ea0',
    'Old Dutch': '#d2691e',
    'Proto-Romance': '#9932cc'
  };

  const languagePeriods = {
    'Old English': '450-1150 AD',
    'Middle English': '1150-1500 AD',
    'Anglo-Norman': '1200-1300 AD',
    'Proto-Germanic': '500 BC-500 AD',
    'Proto-West Germanic': '100-500 AD',
    'Proto-Indo-European': '4500-2500 BC',
    'Latin': '75 BC-500 AD',
    'Classical Latin': '75 BC-200 AD',
    'Vulgar Latin': '200-900 AD',
    'Old French': '842-1400 AD',
    'Gaulish': '600 BC-600 AD',
    'Middle French': '1400-1600 AD',
    'Greek': '800 BC-present',
    'Ancient Greek': '800 BC-600 AD',
    'Old Norse': '700-1350 AD',
    'Proto-Slavic': '1000 BC-500 AD',
    'Sanskrit': '1500-500 BC',
    'Arabic': '500 AD-present',
    'Persian': '550 BC-present',
    'Old Irish': '600-900 AD',
    'Old High German': '750-1050 AD',
    'Proto-Celtic': '1300-800 BC',
    'Proto-Italic': '1500-500 BC',
    'Proto-Balto-Slavic': '3000-1500 BC',
    'Old Saxon': '800-1100 AD',
    'Old Dutch': '500-1150 AD',
    'Proto-Romance': '200-900 AD'
  };

  const getStartYear = (period) => {
  if (!period || period === 'Unknown period') return 0;

  // Match the first number in the string
  const match = period.match(/(\d+)/);
  if (!match) return 0;

  const firstNum = parseInt(match[1]);

  // Decide if it's BC or AD by checking the whole string
  if (/BC/i.test(period)) return -firstNum;
  return firstNum; 
};

  const getMapForYear = (year) => {
  if (year >= 1500) return 'modern'; 
  if (year >= 1350) return '1530'; 
  if (year >= 1200) return '1200'; 
  if (year >= 600) return '1000'; 
  if (year >= 300) return '700'; 
  if (year >= -250) return '1';     
  if (year >= -550) return '-500';
  if (year >= -1000) return '-700';     
  if (year >= -1750) return '-1000';  
  if (year >= -2500) return '-2000';  
  return '-3000';
};

  useEffect(() => {
    fetch(historicalMaps['modern'])
      .then(response => response.json())
      .then(data => {
        setGeoData(data);
        setMapLoading(false);
      })
      .catch(error => {
        console.error('Error loading map data:', error);
        setMapLoading(false);
      });
  }, [historicalMaps]);

  useEffect(() => {
    if (!selectedWord) return;

    const year = activeHistoryItem
      ? getStartYear(activeHistoryItem.period)
      : getStartYear(selectedWord.period);

    const mapId = getMapForYear(year);
    const mapUrl = historicalMaps[mapId];

    setMapLoading(true);

    fetch(mapUrl)
      .then(res => res.json())
      .then(data => {
        setGeoData(data);

        // Update highlightedCountries only AFTER map loads
        const source = activeHistoryItem || selectedWord;
        const color = activeHistoryItem ? source.color : '#6b8e23';
        const highlights = (source.countries || []).reduce((acc, country) => {
          acc[country] = color;
          return acc;
        }, {});
        setHighlightedCountries(highlights);

        setMapLoading(false);
      })
      .catch(error => {
        console.error('Error loading map, falling back to modern:', error);
        fetch(historicalMaps['modern'])
          .then(res => res.json())
          .then(data => {
            setGeoData(data);

            const source = activeHistoryItem || selectedWord;
            const color = activeHistoryItem ? source.color : '#6b8e23';
            const highlights = (source.countries || []).reduce((acc, country) => {
              acc[country] = color;
              return acc;
            }, {});
            setHighlightedCountries(highlights);

            setMapLoading(false);
          });
      });
  }, [selectedWord, activeHistoryItem, historicalMaps]);

  const parseEtymology = (html) => {
    const languageRegions = {
      'Old English': { countries: ['England', 'Cantia'], label: 'Historically spoken in', region: 'Anglo-Saxon England' },
      'Middle English': { countries: ['England'], label: 'Historically spoken in', region: 'Medieval England' },
      'Anglo-Norman': { countries: ['Angevin Empire'], label: 'Historically spoken in', region: 'Norman England and France' },
      'Proto-Germanic': { countries: ['Germanic Tribes', 'Germania', 'Suebi', 'Goths'], label: 'Hypothesized region', region: 'Northern Europe (approximate)' },
      'Proto-West Germanic': { countries: ['West Germanic Tribes', 'Germania', 'Franks'], label: 'Hypothesized region', region: 'Western Germanic territories' },
      'Proto-Indo-European': { countries: ['Scythia', 'Sarmatia', 'Yamnaya'], label: 'Hypothesized homeland', region: 'Pontic-Caspian Steppe (one theory)' },
      'Latin': { countries: ['Roman Empire', 'Rome', 'Italia', 'Latium'], label: 'Historically spoken in', region: 'Ancient Rome and Roman Empire' },
      'Classical Latin': { countries: ['Roman Empire', 'Roman Republic', 'Rome'], label: 'Historically spoken in', region: 'Roman Republic and Empire' },
      'Vulgar Latin': { countries: ['Roman Empire', 'Western Roman Empire', 'Eastern Roman Empire', 'Byzantine Empire'], label: 'Historically spoken in', region: 'Roman Empire territories' },
      'Old French': { countries: ['Kingdom of France', 'France', 'Francia', 'West Francia'], label: 'Historically spoken in', region: 'Medieval France' },
      'Gaulish': { countries: ['La Tène culture'], label: 'Historically spoken in', region: 'Ancient Gaul' },
      'Middle French': { countries: ['Kingdom of France', 'France'], label: 'Historically spoken in', region: 'Late Medieval France' },
      'Greek': { countries: ['Greece', 'Byzantine Empire', 'Eastern Roman Empire', 'Hellas'], label: 'Spoken in', region: 'Greece (ancient to modern)' },
      'Ancient Greek': { countries: ['Ancient Greece', 'Hellas', 'Athens', 'Sparta', 'Macedonia', 'Greek City-States'], label: 'Historically spoken in', region: 'Ancient Greece and Hellenistic world' },
      'Old Norse': { countries: ['Norway', 'Sweden', 'Denmark', 'Norse', 'Vikings'], label: 'Historically spoken in', region: 'Scandinavia and Norse settlements' },
      'Proto-Slavic': { countries: ['Milograd culture', 'Chernoles culture', 'Lusatian culture'], label: 'Hypothesized region', region: 'Eastern Europe (approximate)' },
      'Sanskrit': { countries: ['Vedic Aryans'], label: 'Historically spoken in', region: 'Ancient India' },
      'Arabic': { countries: ['Arabia', 'Arabian Peninsula', 'Caliphate', 'Umayyad', 'Abbasid', 'Egypt', 'Mamluks'], label: 'Originated in', region: 'Arabian Peninsula (now widespread)' },
      'Persian': { countries: ['Persia', 'Persian Empire', 'Achaemenid', 'Parthia', 'Sassanid'], label: 'Historically spoken in', region: 'Ancient Persia' },
      'Old Irish': { countries: ['Ireland', 'Hibernia', 'Irish Kingdoms', 'Celtic kingdoms'], label: 'Historically spoken in', region: 'Medieval Ireland' },
      'Old High German': { countries: ['East Francia', 'Holy Roman Empire', 'Bavaria', 'Swabia'], label: 'Historically spoken in', region: 'Early Medieval Germany' },
      'Proto-Celtic': { countries: ['Celtic Tribes', 'Gaul', 'Gallia', 'Galatia'], label: 'Hypothesized region', region: 'Central/Western Europe (approximate)' },
      'Proto-Italic': { countries: ['Italia', 'Latium', 'Etruria'], label: 'Hypothesized region', region: 'Ancient Italy' },
      'Proto-Balto-Slavic': { countries: ['Baltic Tribes', 'Slavic Tribes'], label: 'Hypothesized region', region: 'Eastern Europe (approximate)' },
      'Old Saxon': { countries: ['Saxony', 'Saxon', 'East Francia'], label: 'Historically spoken in', region: 'Early Medieval Saxony' },
      'Old Dutch': { countries: ['Frisia', 'Low Countries', 'Lotharingia'], label: 'Historically spoken in', region: 'Medieval Low Countries' },
      'Proto-Romance': { countries: ['Roman Empire', 'Western Roman Empire'], label: 'Hypothesized region', region: 'Former Roman Empire territories' }
    };
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const etymologyHeading = Array.from(doc.querySelectorAll('h2, h3, h4, span.mw-headline')).find(h => h.textContent.match(/^Etymology\s*\d*$/i));
    if (!etymologyHeading) return { branches: [], hasMultipleBranches: false };
    
    let contentElement = etymologyHeading.closest('h2, h3, h4');
    if (!contentElement) contentElement = etymologyHeading.parentElement;
    let content = '';
    let nextEl = contentElement?.nextElementSibling;
    
    while (nextEl && !['H2', 'H3', 'H4'].includes(nextEl.tagName)) {
      if (nextEl.tagName === 'P' || nextEl.classList.contains('etyl')) {
        content += nextEl.textContent + ' ';
      }
      nextEl = nextEl.nextElementSibling;
    }
    
    if (!content) return { branches: [], hasMultipleBranches: false };
    
    const branches = [];
    const mainMatch = content.match(/^(.*?)(?:reinforced by|later from|also from|influenced by)/i);
    const mainContent = mainMatch ? mainMatch[1] : content;
    const secondaryMatch = content.match(/(?:reinforced by|later from|also from|influenced by)\s+(.*?)(?:,\s*both from|;|$)/i);
    const secondaryContent = secondaryMatch ? secondaryMatch[1] : '';
    const sharedMatch = content.match(/both from\s+(.*?)(?:\.|;|$)/i);
    const sharedContent = sharedMatch ? sharedMatch[1] : '';
    
    const extractNodes = (text, branchLabel) => {
      const nodes = [];
      const seen = new Set();
      const pattern = /from\s+(Old English|Middle English|Proto-Germanic|Proto-West Germanic|Proto-Indo-European|Latin|Classical Latin|Vulgar Latin|Old French|Anglo-Norman|Middle French|Ancient Greek|Greek|Old Norse|Proto-Slavic|Sanskrit|Arabic|Persian|Old Irish|Old High German|Proto-Celtic|Gaulish|Proto-Italic|Proto-Balto-Slavic|Old Saxon|Old Dutch|Proto-Romance)\s+([^\s,.;()]+)/gi;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const language = match[1];
        let word = match[2];
        word = word.replace(/^[*"']|[*"']$/g, '').trim();
        if (seen.has(language)) continue;
        seen.add(language);
        const regionInfo = languageRegions[language] || { countries: ['Unknown'], label: 'Region', region: 'Unknown' };
        const color = languageColors[language] || '#666';
        const period = languagePeriods[language] || 'Unknown period';
        nodes.push({ word, language, period, countries: regionInfo.countries, regionLabel: regionInfo.label, regionName: regionInfo.region, color, branchLabel });
      }
      return nodes;
    };
    
    if (mainContent) {
      const nodes = extractNodes(mainContent, 'Primary path');
      nodes.sort((a, b) => getStartYear(b.period) - getStartYear(a.period));
      branches.push({ label: 'Primary path', nodes });
    }
    if (secondaryContent) {
      const nodes = extractNodes(secondaryContent, 'Secondary influence');
      nodes.sort((a, b) => getStartYear(b.period) - getStartYear(a.period));
      branches.push({ label: 'Secondary influence', nodes });
    }
    if (sharedContent) {
      const nodes = extractNodes(sharedContent, 'Common ancestry');
      nodes.sort((a, b) => getStartYear(b.period) - getStartYear(a.period));
      branches.push({ label: 'Common ancestry', nodes });
    }
    
    return { branches: branches.filter(b => b.nodes.length > 0), hasMultipleBranches: branches.length > 1 };
  };

    const handleSearch = async (termArg) => {
      const term = typeof termArg === 'string' ? termArg.trim() : searchTerm.trim();
      if (!term) return;

      setSearchTerm(term);
      setSearchLoading(true);

      try {
        const response = await fetch(`https://en.wiktionary.org/api/rest_v1/page/html/${term}`);
        if (response.ok) {
          const htmlText = await response.text();
          const etymology = parseEtymology(htmlText);

          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlText, 'text/html');
          let meaning = 'Definition not available';
          const paragraphs = doc.querySelectorAll('p');
          for (let p of paragraphs) {
            const text = p.textContent.trim();
            if (text && !text.includes('IPA') && !text.includes('vowel') && !text.includes('pronunciation') && !text.includes('Rhymes') && text.length > 20 && text.length < 300) {
              meaning = text;
              break;
            }
          }

          const wiktionaryWord = { 
            word: term, 
            language: 'English', 
            meaning: meaning, 
            period: 'Modern English (1500-present)', 
            countries: ['United Kingdom', 'England'], 
            regionLabel: 'Spoken in', 
            regionName: 'English-speaking countries', 
            etymologyData: etymology 
          };

          setSelectedWord(wiktionaryWord);
          setActiveHistoryItem(null);
        } else {
          alert(`Word "${term}" not found on Wiktionary. Try another word!`);
          setSelectedWord(null);
          setActiveHistoryItem(null);
        }
      } catch (error) {
        console.error('Error fetching from Wiktionary:', error);
        alert('Error connecting to Wiktionary. Please try again.');
        setSelectedWord(null);
        setActiveHistoryItem(null);
      } finally {
        setSearchLoading(false);
      }
    };



  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSearch(); };
  const handleNodeClick = (item) => { setActiveHistoryItem(item); };

  const renderMap = React.useMemo(() => {
    if (mapLoading) return null;
    if (!geoData || !geoData.features) return null;
    if (!geoData || !geoData.features) return null;
    const project = ([lon, lat]) => {
      const width = 900, height = 500;
      const x = (lon + 180) * (width / 360);
      const y = (90 - lat) * (height / 180);
      return [x, y];
    };
    const coordsToPath = (coords) => {
      if (!coords || coords.length === 0) return '';
      const pathParts = coords.map((point, i) => {
        const [x, y] = project(point);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(0)},${y.toFixed(0)}`;
      });
      return pathParts.join('') + 'Z';
    };
    const geometryToPath = (geometry) => {
      if (!geometry) return '';
      const { type, coordinates } = geometry;
      if (type === 'Polygon') return coordinates.map(ring => coordsToPath(ring)).join(' ');
      else if (type === 'MultiPolygon') return coordinates.map(polygon => polygon.map(ring => coordsToPath(ring)).join(' ')).join(' ');
      return '';
    };

    const extractFeatureNames = (properties = {}) => {
      return Object.values(properties)
        .filter(v => typeof v === 'string')
        .map(v => v.toLowerCase().trim());
    };

    const matchesCountry = (featureProperties, searchName) => {
    const featureNames = extractFeatureNames(featureProperties);
    const lowerSearch = searchName.toLowerCase().trim();

    const variations = {
      'england': ['england', 'britannia', 'great britain', 'united kingdom'],
      'united kingdom': ['england', 'britannia', 'great britain'],
      'france': ['france', 'francia', 'gaul', 'gallia', 'west francia'],
      'germany': ['germany', 'germania', 'east francia', 'holy roman empire'],
      'italy': ['italy', 'italia', 'roman empire', 'rome'],
      'greece': ['greece', 'hellas', 'ancient greece'],
      'ireland': ['ireland', 'hibernia'],
      'persia': ['persia', 'persian empire', 'achaemenid', 'parthia', 'sassanid'],
      'india': ['india', 'maurya', 'gupta'],
      'arabia': ['arabia', 'arabian peninsula'],
    };

    const searchVariants = variations[lowerSearch] || [lowerSearch];

    return searchVariants.some(variant =>
      featureNames.some(name => name.includes(variant))
    );
  };

    
    return geoData.features.map((feature, idx) => {
      
      let isHighlighted = false;
      let color = null;
      
      for (const [searchName, searchColor] of Object.entries(highlightedCountries)) {
        if (matchesCountry(feature.properties, searchName)) {
          isHighlighted = true;
          color = searchColor;
          break;
        }
      }
      
      const pathData = geometryToPath(feature.geometry);
      return <path key={idx} d={pathData} fill={color || '#2a2a2a'} stroke="#444" strokeWidth="0.5" opacity={isHighlighted ? 0.9 : 0.3} />;
    });
  }, [geoData, highlightedCountries, mapLoading]);

  // Render etymology tree with clean branching
  const renderEtymologyTree = (etymologyData) => {
    if (!etymologyData || !etymologyData.branches || etymologyData.branches.length === 0) {
      return (
        <div style={{ padding: '1.5rem', background: '#252525', borderRadius: '8px', color: '#999', fontSize: '0.9rem', textAlign: 'center' }}>
          No etymology chain found. This word may be a recent invention or have a complex etymology.
        </div>
      );
    }

    const { branches, hasMultipleBranches } = etymologyData;

    if (!hasMultipleBranches) {
      // Single branch - clean vertical list
      const nodes = branches[0].nodes;
      return (
        <div>
          {nodes.map((node, idx) => (
            <div key={idx} style={{ marginBottom: '0.5rem' }}>
              <div 
                onClick={() => handleNodeClick(node)}
                style={{
                  padding: '0.75rem 1rem',
                  background: activeHistoryItem === node ? '#2d2d2d' : '#252525',
                  border: `2px solid ${activeHistoryItem === node ? node.color : '#333'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: activeHistoryItem === node ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: activeHistoryItem === node ? `0 2px 12px ${node.color}40` : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeHistoryItem !== node) {
                    e.currentTarget.style.borderColor = node.color;
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeHistoryItem !== node) {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: node.color,
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: '500', color: '#e0e0e0', marginBottom: '0.25rem' }}>
                      {node.word}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                      {node.language} • {node.period}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '0.25rem' }}>
                      {node.regionLabel}: {node.regionName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Multiple branches - organized sections
    return (
      <div>
        {branches.map((branch, branchIdx) => (
          <div key={branchIdx} style={{ marginBottom: '2rem' }}>
            {/* Branch label */}
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#777',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.75rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #333'
            }}>
              {branch.label}
            </div>
            
            {/* Nodes in branch */}
            <div>
              {branch.nodes.map((node, idx) => (
                <div key={idx} style={{ marginBottom: '0.5rem' }}>
                  <div 
                    onClick={() => handleNodeClick(node)}
                    style={{
                      padding: '0.75rem 1rem',
                      background: activeHistoryItem === node ? '#2d2d2d' : '#252525',
                      border: `2px solid ${activeHistoryItem === node ? node.color : '#333'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: activeHistoryItem === node ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: activeHistoryItem === node ? `0 2px 12px ${node.color}40` : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (activeHistoryItem !== node) {
                        e.currentTarget.style.borderColor = node.color;
                        e.currentTarget.style.transform = 'scale(1.01)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeHistoryItem !== node) {
                        e.currentTarget.style.borderColor = '#333';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: node.color,
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1rem', fontWeight: '500', color: '#e0e0e0', marginBottom: '0.25rem' }}>
                          {node.word}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#999' }}>
                          {node.language} • {node.period}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '0.25rem' }}>
                          {node.regionLabel}: {node.regionName}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a1a',
      color: '#e0e0e0',
      fontFamily: 'Georgia, serif',
      padding: '2rem'
    }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1
          onClick={() => {
            setSearchTerm('');         
            setSelectedWord(null);     
            setActiveHistoryItem(null); 
            setHighlightedCountries({});
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{ 
            fontSize: '2rem', 
            fontWeight: 'normal',
            marginBottom: '0.5rem',
            color: '#f5f5f5',
            cursor: 'pointer',    
            userSelect: 'none' 
          }}
        >
          Etymology Explorer
        </h1>

        <p style={{ 
          color: '#999', 
          fontSize: '0.95rem',
          fontStyle: 'italic'
        }}>
          Trace the evolution of any English word through time and space
        </p>
      </header>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', maxWidth: '600px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter any English word (e.g., mother, water, democracy)"
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            background: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '4px',
            color: '#e0e0e0',
            fontFamily: 'Georgia, serif'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={searchLoading}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            background: searchLoading ? '#2a2a2a' : '#3a3a3a',
            border: '1px solid #555',
            borderRadius: '4px',
            color: '#e0e0e0',
            cursor: searchLoading ? 'wait' : 'pointer',
            fontFamily: 'Georgia, serif'
          }}
        >
          {searchLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {selectedWord ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1.5rem',
              fontWeight: 'normal',
              borderBottom: '1px solid #333',
              paddingBottom: '0.5rem'
            }}>
              Etymology Tree
            </h2>
            
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#252525', borderRadius: '4px', fontSize: '0.85rem', color: '#999' }}>
              💡 Click on any node to see where it was spoken
            </div>

            {/* Modern word (root node) */}
            <div style={{ marginBottom: '1rem' }}>
              <div 
                onClick={() => {
                  setActiveHistoryItem(null);
                  // Always explicitly set highlights for modern English
                  const highlights = (selectedWord.countries || []).reduce((acc, country) => {
                    acc[country] = '#6b8e23';
                    return acc;
                  }, {});
                  setHighlightedCountries(highlights);
                }}
                style={{
                  padding: '1rem 1.25rem',
                  background: !activeHistoryItem ? 'linear-gradient(135deg, #2d3a2d 0%, #252d25 100%)' : '#252525',
                  border: `2px solid ${!activeHistoryItem ? '#6b8e23' : '#333'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: !activeHistoryItem ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: !activeHistoryItem ? '0 2px 8px rgba(107, 142, 35, 0.15)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeHistoryItem) {
                    e.currentTarget.style.borderColor = '#6b8e23';
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeHistoryItem) {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#6b8e23',
                    boxShadow: '0 0 8px rgba(107, 142, 35, 0.4)'
                  }} />
                  <div style={{ fontSize: '1.35rem', fontWeight: '500', color: '#e8e8e8' }}>
                    {selectedWord.word}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#999', marginLeft: '1.75rem' }}>
                  {selectedWord.language} • {selectedWord.period}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '0.5rem', marginLeft: '1.75rem', lineHeight: '1.4' }}>
                  {selectedWord.meaning}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b8e23', marginTop: '0.5rem', marginLeft: '1.75rem' }}>
                  {selectedWord.regionLabel}: {selectedWord.regionName}
                </div>
              </div>
            </div>

            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#777',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.75rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #333'
            }}>
              Etymology
            </div>

            {/* Etymology tree */}
            {renderEtymologyTree(selectedWord.etymologyData)}
          </div>

          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1.5rem',
              fontWeight: 'normal',
              borderBottom: '1px solid #333',
              paddingBottom: '0.5rem'
            }}>
              Geographic Distribution
            </h2>

            <div style={{ position: 'relative' }}>
              <svg 
                viewBox="0 0 900 500"
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  background: '#0a1929',
                  borderRadius: '4px',
                  border: '1px solid #333',
                  opacity: mapLoading ? 0.3 : 1,
                  transition: 'opacity 0.2s ease'
                }}
              >
                {renderMap}
              </svg>
              
              {mapLoading && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #333',
                    borderTopColor: '#6b8e23',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <div style={{ color: '#999', fontSize: '0.9rem' }}>Updating map...</div>
                  <style>
                    {`@keyframes spin { to { transform: rotate(360deg); } }`}
                  </style>
                </div>
              )}
            </div>

            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: '#252525', 
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: '#999'
            }}>
              <strong style={{ color: '#e0e0e0' }}>Note on geographic representation:</strong>
              <div style={{ marginTop: '0.5rem', lineHeight: '1.5' }}>
                  Historical maps have been used to approximate the geographic distribution of languages at different periods. 
                  Proto-languages represent hypothesized reconstructions, and their geographic origins remain subjects 
                  of ongoing scholarly debate. Highlighted countries indicate approximate regions where these languages 
                  were historically spoken or theorized to have originated. However, boundaries are approximate, 
                  and exact locations or extents of language use cannot be guaranteed. Treat the map as a general 
                  visual guide rather than a precise historical record.
              </div>
            </div>
          </div>
        </div>
      ) : (
       <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          color: '#666'
        }}>
          {searchLoading ? (
            <div style={{ fontSize: '1.1rem' }}>
              🔍 Searching Wiktionary...
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                Search for any English word to explore its etymology and geographic origins
              </div>
              <div style={{ fontSize: '0.95rem', color: '#888', marginBottom: '0.75rem' }}>
                Discover fascinating etymological paths:
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '0.75rem',
                maxWidth: '700px',
                margin: '0 auto',
                fontSize: '0.85rem'
              }}>
                {[
                  { word: 'algorithm', path: 'Arabic' },
                  { word: 'geography', path: 'Greek' },
                  { word: 'parliament', path: 'Norman' },
                  { word: 'house', path: 'Germanic' },
                  { word: 'egg', path: 'Norse' },
                  { word: 'lemon', path: 'Persian' },
                  { word: 'cavalier', path: 'Gaulish' },
                  { word: 'paprika', path: 'Slavic' },
                  { word: 'banshee', path: 'Irish' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSearch(item.word)}
                    style={{
                      padding: '0.75rem',
                      background: '#252525',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: '1px solid #333',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2d2d2d';
                      e.currentTarget.style.borderColor = '#555';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#252525';
                      e.currentTarget.style.borderColor = '#333';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div style={{ color: '#e0e0e0', marginBottom: '0.25rem', fontWeight: '500' }}>
                      {item.word}
                    </div>
                    <div style={{ color: '#777', fontSize: '0.75rem' }}>
                      {item.path} roots
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;