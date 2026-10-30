/*
 ╔═══════════════════════════════════════════════════════════╗
 ║   P R O F E S S O R E N T E   ·   P O R T F O L I O       ║
 ║   Inhalte der Website – hier kannst du alles anpassen     ║
 ╚═══════════════════════════════════════════════════════════╝
 Neue FiveM-Scripts einfach im Block "scripts" ergänzen (Vorlage kopieren).
*/
window.PE_DATA = {

  roles: [
    {
      id: 'support',
      label: 'Support',
      headline: 'Ansprechpartner, der Spieler und Technik versteht.',
      text: 'Ein gutes Support-Team braucht Ruhe, Struktur und ein Verständnis dafür, was im Hintergrund passiert. Ich bringe beides mit: den Blick der Spieler und das technische Wissen eines Entwicklers.',
      points: [
        'Anliegen sauber aufnehmen, einordnen und nachvollziehbar lösen',
        'Fehler in Scripts und Konfigurationen schnell eingrenzen',
        'Freundlich und klar kommunizieren, auch wenn es hitzig wird',
        'Regeln fair und konsequent anwenden'
      ]
    },
    {
      id: 'management',
      label: 'Management',
      headline: 'Viel Erfahrung darin, Menschen und Abläufe zu führen.',
      text: 'Management ist der Bereich, in dem ich besonders viel Erfahrung habe. Ich übernehme Verantwortung, halte Teams auf Kurs und sorge dafür, dass aus guten Ideen laufende Projekte werden.',
      points: [
        'Teams koordinieren, Aufgaben verteilen, Fortschritt im Blick behalten',
        'Abläufe und Zuständigkeiten klar strukturieren',
        'Entscheidungen treffen und dazu stehen',
        'Projekte von der ersten Idee bis zum Release begleiten'
      ]
    },
    {
      id: 'development',
      label: 'Development',
      headline: 'Fertige Systeme statt halber Prototypen.',
      text: 'Ich entwickle FiveM-Resources von Grund auf: Server, Client und Oberfläche. Mein Anspruch ist, dass alles, was ich liefere, sofort läuft, sich konfigurieren lässt und auf Deutsch dokumentiert ist.',
      points: [
        'Lua 5.4 für Server- und Client-Logik',
        'NUI-Oberflächen in HTML, CSS und JavaScript',
        'ESX, QBCore und Qbox mit ox_lib und oxmysql',
        'Framework-Erkennung, saubere Configs, Syntaxprüfung vor jeder Auslieferung'
      ]
    }
  ],

  categories: ['Alle', 'Medizin', 'Administration', 'Fahrzeuge & Luftfahrt', 'Gameplay & Tools', 'Jobs & Forensik'],

  scripts: [
    {
      name: 'ProfessorEnte Medical System',
      slug: '',
      cat: 'Medizin',
      featured: true,
      desc: 'Hyperrealistisches Medical-Roleplay von Grund auf: Pharmakologie, Herzstillstand, Vitalwerte-Monitor und eine Verletzungserkennung, die jede Körperzone kennt.',
      highlights: [
        'Über 60 Items in 12 Kategorien mit kumulativer Dosierung, Halbwertszeiten, Überdosis und Antagonisten',
        'Herzstillstand mit 30-Sekunden-Countdown, AED mit rhythmusabhängiger Schock-Logik',
        'Live-EKG und SpO2 als Canvas-Kurven in der Oberfläche',
        'Verletzungen aus echten Schadens-Events, Knochen-zu-Körperzone-Zuordnung, waffenabhängige Schwere',
        'CPR, Tragen, Fahrzeugverladung, Leichensack, NPC-Sanitäter, komplette Admin-Befehle'
      ],
      stack: ['Lua', 'NUI', 'HTML/CSS/JS']
    },
    {
      name: 'aed_system',
      slug: 'aed_system',
      cat: 'Medizin',
      desc: 'Realistischer Defibrillator mit eigener Oberfläche und deutscher Sprachausgabe.',
      highlights: [
        'Läuft standalone sowie mit ESX, QBCore und Qbox',
        'AED-Prop und visn_are-Abhängigkeit sind per Config zuschaltbar',
        'Deutsche Sprachführung wie beim echten Gerät'
      ],
      stack: ['Lua', 'NUI', 'Multi-Framework']
    },
    {
      name: 'aduty_holo',
      slug: 'aduty_holo',
      cat: 'Administration',
      desc: 'Admin-Duty-System für ESX mit holografischem Look und umfangreichem Menü.',
      highlights: [
        'Fünf Tabs: Allgemein, Developer-Tools, Troll-Aktionen, High-Team und Fahrzeug-Tuning',
        'Integration mit ox_lib',
        'Komplettes Fahrzeug-Tuning direkt aus dem Admin-Menü'
      ],
      stack: ['Lua', 'ESX', 'ox_lib', 'NUI']
    },
    {
      name: 'pe_superhero',
      slug: 'pe_superhero',
      cat: 'Gameplay & Tools',
      desc: 'Ein vollständiges Superhelden-Fähigkeitensystem für FiveM.',
      highlights: [
        'Eigenes Fähigkeiten-System mit durchgehendem ProfessorEnte-Branding'
      ],
      stack: ['Lua', 'NUI']
    },
    {
      name: 'pe_npcbuilder',
      slug: 'pe_npcbuilder',
      cat: 'Gameplay & Tools',
      desc: 'Persistenter NPC-Builder und Designer, gemacht für MLO-Interiors.',
      highlights: [
        'NPCs gestalten, platzieren und dauerhaft speichern',
        'Ideal, um MLOs mit Leben zu füllen'
      ],
      stack: ['Lua', 'NUI', 'MLO']
    },
    {
      name: 'suspension_damage',
      slug: 'suspension_damage',
      cat: 'Fahrzeuge & Luftfahrt',
      desc: 'Hyperrealistischer Federschaden an Fahrzeugen mit Reparatur-Minispiel.',
      highlights: [
        'Erkennt QBCore und ESX automatisch',
        'Serverseitige Autorität über StateBags',
        'NUI-Minispiel für die Reparatur'
      ],
      stack: ['Lua', 'StateBags', 'QBCore', 'ESX']
    },
    {
      name: 'helicheck',
      slug: 'helicheck',
      cat: 'Fahrzeuge & Luftfahrt',
      desc: 'Wartungssystem für Hubschrauber: der Ursprung der Helicheck-Reihe.',
      highlights: [
        'Inspektion und Wartung als eigener Spielablauf'
      ],
      stack: ['Lua', 'NUI']
    },
    {
      name: 'helicheck_lrge_extremeflight',
      slug: 'helicheck_lrge_extremeflight',
      cat: 'Fahrzeuge & Luftfahrt',
      desc: 'Diagnose und Reparatur für Hubschrauber mit Luftfahrt-HUD und mehreren Minispielen.',
      highlights: [
        'Vollständiges Aviation-HUD als NUI',
        'Mehrere Minispiele für Diagnose und Reparatur',
        'Physik-Fehler beim automatischen Steigen gelöst'
      ],
      stack: ['Lua', 'NUI', 'Minispiele']
    },
    {
      name: 'csi_forensics',
      slug: 'csi_forensics',
      cat: 'Jobs & Forensik',
      desc: 'Fingerabdrücke und Spurensicherung mit Detektiv-Pinnwand als Oberfläche.',
      highlights: [
        'Für ESX mit ox_lib und oxmysql',
        'Beweise sammeln, auswerten und auf der Korkwand verknüpfen'
      ],
      stack: ['Lua', 'ESX', 'ox_lib', 'oxmysql']
    }
  ],

  projects: [
    { title: 'Duck Wars', category: 'Spiele', desc: 'Top-Down-Auto-Shooter im Browser mit 100 Levels und 12 Waffen.', details: ['Ein eigenes Browser-Spiel aus der Vogelperspektive.', '100 Levels und 12 Waffen gehören zum Spielumfang.'], tags: ['HTML5', 'Spiel'] },
    { title: 'Unity-Horrorspiel', category: 'Spiele', desc: 'Horrorspiel mit 28 C#-Scripts und deutscher Einrichtungsanleitung.', details: ['Das Projekt umfasst 28 C#-Skripte.', 'Eine deutsche Anleitung erklärt die Einrichtung.'], tags: ['Unity', 'C#'] },
    { title: 'Chaos Mod', category: 'Mods', desc: 'Fabric-Mod für Minecraft 1.20.1, ausgeliefert als fertiges Paket.', details: ['Für Minecraft 1.20.1 mit Fabric entwickelt.', 'Als fertiges Paket zum Einrichten vorbereitet.'], tags: ['Fabric', 'Minecraft'] },
    { title: 'DRK-Website im Röntgen-Look', category: 'Web & Apps', desc: 'Scroll-Animation von der Wirbelsäule bis zum Kreuz, gebaut mit Three.js.', details: ['Beim Scrollen führt die Animation von der Wirbelsäule bis zum Kreuz.', 'Die visuelle Umsetzung nutzt Three.js und WebGL.'], tags: ['Three.js', 'WebGL'] },
    { title: 'Audi-Autohaus-Website', category: '3D & Animation', desc: 'Das originale Audi-RS-6-Modell setzt sich in einer interaktiven Three.js-Montage Teil für Teil zusammen.', details: ['Das originale RS 6 Avant-Modell wird Stück für Stück zusammengesetzt.', 'Du kannst die 3D-Szene drehen und die Montage neu starten.'], tags: ['Three.js', 'FBX', '3D-Animation'] },
    { title: 'SCP-Datenbank', category: 'Web & Apps', desc: 'Fan-Website mit Tresor-Intro, Suche, Filtern und Fallakten.', details: ['Ein Tresor-Intro bildet den Einstieg in die Fan-Website.', 'Suche und Filter helfen dabei, die Fallakten zu durchsuchen.'], tags: ['React', 'TypeScript', 'Tailwind'] },
    { title: 'MedicNet', category: 'Web & Apps', desc: 'App für den Sanitätsdienst: Patientenprotokolle, Unterschrift per Stift, Normwerte, Metronom.', details: ['Vereint Patientenprotokolle, Stift-Unterschrift, Normwerte und Metronom.', 'Das Projekt befindet sich in Entwicklung.'], tags: ['App', 'in Entwicklung'] }
  ],

  roadmap: [
    { title: 'Car Development', text: 'Eigene Fahrzeuge für FiveM entwickeln – von der Handling-Abstimmung bis zum fertigen Add-on.', label: 'Lernfeld' },
    { title: 'MLOs', text: 'Interiors gestalten und in Spielwelten einbinden, damit neue Orte spielbar werden.', label: 'Lernfeld' },
    { title: 'Skinning', text: 'Eigene Designs und Texturen für Fahrzeuge und Kleidung umsetzen.', label: 'Lernfeld' },
    { title: 'MedicNet', text: 'Die Sanitätsdienst-App mit Patientenprotokollen, Normwerten, Unterschrift und Metronom weiterentwickeln.', label: 'In Entwicklung' }
  ],

  learning: [
    {
      title: 'Car Development',
      text: 'Eigene Fahrzeuge für FiveM entwickeln: von der Handling-Abstimmung bis zum fertigen Addon.',
      icon: 'car'
    },
    {
      title: 'MLOs',
      text: 'Interiors modellieren und einbinden, damit Gebäude nicht nur Kulisse sind, sondern Räume zum Spielen.',
      icon: 'building'
    },
    {
      title: 'Skinning',
      text: 'Fahrzeuge und Kleidung mit eigenen Texturen gestalten, vom Livery-Entwurf bis zum Ingame-Ergebnis.',
      icon: 'brush'
    }
  ],

  stack: ['Lua 5.4', 'ESX', 'QBCore', 'Qbox', 'ox_lib', 'oxmysql', 'NUI', 'JavaScript', 'HTML & CSS', 'Three.js', 'React', 'TypeScript', 'Unity', 'C#', 'Python', 'Fabric']
};
