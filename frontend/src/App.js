import React, { useState, useEffect } from 'react';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWord, setSelectedWord] = useState(null);
  const [activeHistoryItem, setActiveHistoryItem] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    // Load complete world GeoJSON
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(response => response.json())
      .then(data => {
        setGeoData(data);
        setMapLoading(false);
      })
      .catch(error => {
        console.error('Error loading map data:', error);
        setMapLoading(false);
      });
  }, []);

  const languageColors = {
    'Old English': '#8b7355',
    'Middle English': '#9b8365',
    'Proto-Germanic': '#6b8e23',
    'Proto-West Germanic': '#7b9e33',
    'Proto-Indo-European': '#8b6914',
    'Latin': '#9370db',
    'Classical Latin': '#8360cb',
    'Vulgar Latin': '#a380eb',
    'Old French': '#4169e1',
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
    'Proto-Germanic': '500 BC-500 AD',
    'Proto-West Germanic': '100-500 AD',
    'Proto-Indo-European': '4500-2500 BC',
    'Latin': '75 BC-500 AD',
    'Classical Latin': '75 BC-200 AD',
    'Vulgar Latin': '200-900 AD',
    'Old French': '842-1400 AD',
    'Middle French': '1400-1600 AD',
    'Greek': '800 BC-present',
    'Ancient Greek': '800 BC-600 AD',
    'Old Norse': '700-1350 AD',
    'Proto-Slavic': '1500 BC-500 AD',
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

  // Helper function to extract start year from period string
  const getStartYear = (period) => {
    if (!period || period === 'Unknown period') return 0;
    
    // Handle BC dates
    const bcMatch = period.match(/(\d+)\s*BC/);
    if (bcMatch) return -parseInt(bcMatch[1]);
    
    // Handle AD dates
    const adMatch = period.match(/(\d+)(?:\s*AD|-)/);
    if (adMatch) return parseInt(adMatch[1]);
    
    return 0;
  };

  // Enhanced etymology parser that detects branches
  const parseEtymology = (html) => {
    // Language to region mapping (more precise historical regions)
    const languageRegions = {
      'Old English': {
        countries: ['United Kingdom'],
        label: 'Historically spoken in',
        region: 'Anglo-Saxon England'
      },
      'Middle English': {
        countries: ['United Kingdom'],
        label: 'Historically spoken in',
        region: 'Medieval England'
      },
      'Proto-Germanic': {
        countries: ['Germany', 'Denmark', 'Netherlands', 'Norway', 'Sweden'],
        label: 'Hypothesized region',
        region: 'Northern Europe (approximate)'
      },
      'Proto-West Germanic': {
        countries: ['Germany', 'Netherlands', 'Belgium'],
        label: 'Hypothesized region',
        region: 'Western Germanic territories'
      },
      'Proto-Indo-European': {
        countries: ['Ukraine'],
        label: 'Hypothesized homeland',
        region: 'Pontic-Caspian Steppe (one theory)'
      },
      'Latin': {
        countries: ['Italy'],
        label: 'Historically spoken in',
        region: 'Ancient Rome and Roman Empire'
      },
      'Classical Latin': {
        countries: ['Italy'],
        label: 'Historically spoken in',
        region: 'Roman Republic and Empire'
      },
      'Vulgar Latin': {
        countries: ['Italy', 'France', 'Spain', 'Portugal', 'Romania'],
        label: 'Historically spoken in',
        region: 'Roman Empire territories'
      },
      'Old French': {
        countries: ['France'],
        label: 'Historically spoken in',
        region: 'Medieval France'
      },
      'Anglo-Norman': {
        countries: ['United Kingdom', 'France'],
        label: 'Historically spoken in',
        region: 'Norman England and France'
      },
      'Middle French': {
        countries: ['France'],
        label: 'Historically spoken in',
        region: 'Late Medieval France'
      },
      'Greek': {
        countries: ['Greece'],
        label: 'Spoken in',
        region: 'Greece (ancient to modern)'
      },
      'Ancient Greek': {
        countries: ['Greece'],
        label: 'Historically spoken in',
        region: 'Ancient Greece and Hellenistic world'
      },
      'Old Norse': {
        countries: ['Norway', 'Sweden', 'Denmark', 'Iceland'],
        label: 'Historically spoken in',
        region: 'Scandinavia and Norse settlements'
      },
      'Proto-Slavic': {
        countries: ['Poland', 'Ukraine'],
        label: 'Hypothesized region',
        region: 'Eastern Europe (approximate)'
      },
      'Sanskrit': {
        countries: ['India'],
        label: 'Historically spoken in',
        region: 'Ancient India'
      },
      'Arabic': {
        countries: ['Saudi Arabia'],
        label: 'Originated in',
        region: 'Arabian Peninsula (now widespread)'
      },
      'Persian': {
        countries: ['Iran'],
        label: 'Historically spoken in',
        region: 'Ancient Persia'
      },
      'Old Irish': {
        countries: ['Ireland'],
        label: 'Historically spoken in',
        region: 'Medieval Ireland'
      },
      'Old High German': {
        countries: ['Germany', 'Austria', 'Switzerland'],
        label: 'Historically spoken in',
        region: 'Early Medieval Germany'
      },
      'Proto-Celtic': {
        countries: ['Ireland', 'United Kingdom', 'France'],
        label: 'Hypothesized region',
        region: 'Central/Western Europe (approximate)'
      },
      'Gaulish': {
        countries: ['France', 'Belgium'],
        label: 'Historically spoken in',
        region: 'Ancient Gaul'
      },
      'Proto-Italic': {
        countries: ['Italy'],
        label: 'Hypothesized region',
        region: 'Ancient Italy'
      },
      'Proto-Balto-Slavic': {
        countries: ['Poland', 'Lithuania', 'Latvia'],
        label: 'Hypothesized region',
        region: 'Eastern Europe (approximate)'
      },
      'Old Saxon': {
        countries: ['Germany', 'Netherlands'],
        label: 'Historically spoken in',
        region: 'Early Medieval Saxony'
      },
      'Old Dutch': {
        countries: ['Netherlands', 'Belgium'],
        label: 'Historically spoken in',
        region: 'Medieval Low Countries'
      },
      'Proto-Romance': {
        countries: ['Italy', 'France', 'Spain', 'Portugal'],
        label: 'Hypothesized region',
        region: 'Former Roman Empire territories'
      }
    };
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Find Etymology section
    const etymologyHeading = Array.from(doc.querySelectorAll('h2, h3, h4, span.mw-headline'))
      .find(h => h.textContent.match(/^Etymology\s*\d*$/i));
    
    if (!etymologyHeading) return { branches: [], hasMultipleBranches: false };
    
    // Get the parent element and find content
    let contentElement = etymologyHeading.closest('h2, h3, h4');
    if (!contentElement) contentElement = etymologyHeading.parentElement;
    
    let content = '';
    let nextEl = contentElement?.nextElementSibling;
    
    // Collect all paragraphs until next heading
    while (nextEl && !['H2', 'H3', 'H4'].includes(nextEl.tagName)) {
      if (nextEl.tagName === 'P' || nextEl.classList.contains('etyl')) {
        content += nextEl.textContent + ' ';
      }
      nextEl = nextEl.nextElementSibling;
    }
    
    if (!content) return { branches: [], hasMultipleBranches: false };
    
    // Split content into main path and branches
    const branches = [];
    
    // Main branch (before "reinforced by" or "later from")
    const mainMatch = content.match(/^(.*?)(?:reinforced by|later from|also from|influenced by)/i);
    const mainContent = mainMatch ? mainMatch[1] : content;
    
    // Secondary branch (after "reinforced by" etc)
    const secondaryMatch = content.match(/(?:reinforced by|later from|also from|influenced by)\s+(.*?)(?:,\s*both from|;|$)/i);
    const secondaryContent = secondaryMatch ? secondaryMatch[1] : '';
    
    // Shared ancestry (after "both from")
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
        
        const regionInfo = languageRegions[language] || {
          countries: ['Unknown'],
          label: 'Region',
          region: 'Unknown'
        };
        
        const color = languageColors[language] || '#666';
        const period = languagePeriods[language] || 'Unknown period';
        
        nodes.push({
          word,
          language,
          period,
          countries: regionInfo.countries,
          regionLabel: regionInfo.label,
          regionName: regionInfo.region,
          color,
          branchLabel
        });
      }
      
      return nodes;
    };
    
    // Extract nodes from each section and sort by year (newest first - reverse chronological)
    if (mainContent) {
      const nodes = extractNodes(mainContent, 'Primary path');
      nodes.sort((a, b) => getStartYear(b.period) - getStartYear(a.period));
      branches.push({
        label: 'Primary path',
        nodes
      });
    }
    
    if (secondaryContent) {
      const nodes = extractNodes(secondaryContent, 'Secondary influence');
      nodes.sort((a, b) => getStartYear(b.period) - getStartYear(a.period));
      branches.push({
        label: 'Secondary influence',
        nodes
      });
    }
    
    if (sharedContent) {
      const nodes = extractNodes(sharedContent, 'Common ancestry');
      nodes.sort((a, b) => getStartYear(b.period) - getStartYear(a.period));
      branches.push({
        label: 'Common ancestry',
        nodes
      });
    }
    
    return {
      branches: branches.filter(b => b.nodes.length > 0),
      hasMultipleBranches: branches.length > 1
    };
  };

  const handleSearch = async () => {
    const term = searchTerm.trim();
    
    if (!term) return;
    
    setSearchLoading(true);
    try {
      // Fetch page HTML from Wiktionary
      const response = await fetch(`https://en.wiktionary.org/api/rest_v1/page/html/${term}`);
      
      if (response.ok) {
        const htmlText = await response.text();
        
        // Parse etymology from HTML
        const etymology = parseEtymology(htmlText);
        
        // Extract a clean definition from the first paragraph after English heading
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        
        // Find the English section and get the first definition paragraph
        let meaning = 'Definition not available';
        const paragraphs = doc.querySelectorAll('p');
        for (let p of paragraphs) {
          const text = p.textContent.trim();
          // Skip pronunciation guides and etymology notes
          if (text && 
              !text.includes('IPA') && 
              !text.includes('vowel') &&
              !text.includes('pronunciation') &&
              !text.includes('Rhymes') &&
              text.length > 20 &&
              text.length < 300) {
            meaning = text;
            break;
          }
        }
        
        // Create word object from Wiktionary data
        const wiktionaryWord = {
          word: term,
          language: 'English',
          meaning: meaning,
          period: 'Modern English (1500-present)',
          countries: ['United Kingdom'],
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleNodeClick = (item) => {
    setActiveHistoryItem(item);
    // Brief loading state for map responsiveness
    setMapLoading(true);
    setTimeout(() => setMapLoading(false), 100);
  };

  // Determine which countries to highlight
  const highlightedCountries = React.useMemo(() => {
    if (!selectedWord) return {};
    
    if (activeHistoryItem) {
      return activeHistoryItem.countries.reduce((acc, country) => {
        acc[country] = activeHistoryItem.color;
        return acc;
      }, {});
    } else {
      return selectedWord.countries.reduce((acc, country) => {
        acc[country] = '#6b8e23';
        return acc;
      }, {});
    }
  }, [selectedWord, activeHistoryItem]);

  // Render world map - OPTIMIZED with React.memo
  const renderMap = React.useMemo(() => {
    if (!geoData || !geoData.features) return null;

    // Project coordinates (simple equirectangular projection)
    const project = ([lon, lat]) => {
      const width = 900;
      const height = 500;
      const x = (lon + 180) * (width / 360);
      const y = (90 - lat) * (height / 180);
      return [x, y];
    };

    // Convert coordinates to SVG path with reduced precision
    const coordsToPath = (coords) => {
      if (!coords || coords.length === 0) return '';
      
      const pathParts = coords.map((point, i) => {
        const [x, y] = project(point);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(0)},${y.toFixed(0)}`;
      });
      
      return pathParts.join('') + 'Z';
    };

    // Handle different geometry types
    const geometryToPath = (geometry) => {
      if (!geometry) return '';
      
      const { type, coordinates } = geometry;
      
      if (type === 'Polygon') {
        return coordinates.map(ring => coordsToPath(ring)).join(' ');
      } else if (type === 'MultiPolygon') {
        return coordinates.map(polygon => 
          polygon.map(ring => coordsToPath(ring)).join(' ')
        ).join(' ');
      }
      
      return '';
    };

    return geoData.features.map((feature, idx) => {
      const countryName = feature.properties?.ADMIN || feature.properties?.name || '';
      
      // Check if this country should be highlighted
      const isHighlighted = Object.keys(highlightedCountries).some(name => {
        return countryName.includes(name) || name === countryName;
      });
      
      const color = isHighlighted 
        ? Object.entries(highlightedCountries).find(([name]) => 
            countryName.includes(name) || name === countryName
          )?.[1]
        : null;

      const pathData = geometryToPath(feature.geometry);

      return (
        <path
          key={idx}
          d={pathData}
          fill={color || '#2a2a2a'}
          stroke="#444"
          strokeWidth="0.5"
          opacity={isHighlighted ? 0.9 : 0.3}
        />
      );
    });
  }, [geoData, highlightedCountries]);

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
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'normal',
          marginBottom: '0.5rem',
          color: '#f5f5f5'
        }}>
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
                onClick={() => setActiveHistoryItem(null)}
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
                Modern political boundaries are used as approximations for historical language regions. 
                Proto-languages represent hypothesized reconstructions, and their geographic origins remain 
                subjects of ongoing scholarly debate. Countries highlighted indicate approximate historical 
                regions where these languages were spoken or theorized to have originated.
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
              <div style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Search for any English word to explore its etymology and geographic origins
              </div>
              <div style={{ fontSize: '0.9rem', color: '#888' }}>
                Try: machine, democracy, algorithm, or any word you're curious about!
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;