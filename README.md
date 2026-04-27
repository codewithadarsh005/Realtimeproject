# AI Phishing Detection System

A full-stack cybersecurity dashboard for detecting phishing URLs, emails, and SMS messages.

## Features

- **URL Scanning**: Analyze URLs for phishing indicators and malicious patterns
- **Message Analysis**: Detect phishing in emails and SMS messages
- **Threat Intelligence**: Integrated with multiple threat intelligence sources
- **Real-time Detection**: ML-powered analysis with confidence scoring
- **Dashboard**: Comprehensive threat monitoring and statistics

## Threat Intelligence Sources

The system integrates with multiple threat intelligence providers:

- **Local Database**: Curated indicators for common phishing campaigns
- **OpenPhish**: Community-driven phishing URL database
- **PhishTank**: Verified phishing URLs from the PhishTank community
- **AlienVault OTX**: Open Threat Exchange intelligence feeds
- **URLhaus**: Malware URL database from abuse.ch

## Setup

### Backend
```bash
cd server
npm install
# Edit .env with your MongoDB URI and threat intelligence API keys
npm run dev
```

### Frontend
```bash
cd client
npm install
npm start
```

## Configuration

### Environment Variables (.env)

```bash
# Database
MONGO_URI=mongodb://localhost:27017/phishing_detection

# Server
PORT=5000
NODE_ENV=development

# CORS
CLIENT_ORIGIN=http://localhost:3000
SERVER_ORIGIN=http://localhost:5000

# Threat Intelligence Providers
OPENPHISH_ENABLED=false
PHISHTANK_ENABLED=false
ALIENVAULT_ENABLED=false
URLHAUS_ENABLED=false

# Optional API Keys
# OPENPHISH_API_KEY=your_key_here
# PHISHTANK_API_KEY=your_key_here
# ALIENVAULT_API_KEY=your_key_here
# URLHAUS_API_KEY=your_key_here
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/scan/url | Scan a URL |
| POST | /api/scan/message | Scan email/SMS |
| GET | /api/threats | Get all scan results |
| GET | /api/threats/stats | Get summary stats |
| POST | /api/threats/cache/clear | Clear threat intelligence cache |

## Threat Intelligence Updates

The threat intelligence database is regularly updated with new indicators. To update the local indicators:

1. Edit `server/services/threatIntelligence/indicators/mockIndicators.json`
2. Add new domains, URLs, IPs, and keywords
3. Clear the cache: `POST /api/threats/cache/clear`

For production deployments, consider integrating with real-time threat intelligence feeds.
