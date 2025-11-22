# Vision Beyond

Vision Beyond is an AI-powered accessibility platform that provides real-time assistance for people with visual, hearing, and speech impairments. The platform combines computer vision, machine learning, and natural language processing to create an inclusive digital experience.

## Features

- **Visual Assistance**: Real-time object detection and scene description
- **Hearing Assistance**: Sign language recognition and translation
- **Speech Assistance**: Text-to-speech conversion for communication
- **Safety Monitoring**: Fall detection and emergency alerts
- **Analytics Dashboard**: Usage statistics and performance metrics

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- Supabase account
- Murf AI API key
- Raspberry Pi (optional, for hardware integration)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/vision-beyond.git
cd vision-beyond
```

2. Install dependencies:
```bash
npm install
```

3. Edit `.env.local` with your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
MURF_AI_API_KEY=your_murf_ai_api_key
RASPBERRY_PI_STREAM_URL=ws://localhost:8765
YOLO_API_URL=http://localhost:5001
SIGN_LANGUAGE_API_URL=http://localhost:5002
```

4. Run database migrations:
```bash
# Run the schema.sql file in your Supabase SQL editor
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Setting Up ML Models

#### YOLO Object Detection

```bash
cd ml-models/yolo
pip install -r requirements.txt
python detector.py
```

#### Sign Language Recognition

```bash
cd ml-models/sign-language
pip install -r requirements.txt
python detector.py
```

### Setting Up Raspberry Pi

```bash
cd raspberry-pi
python camera_stream.py
```

## Project Structure

```
vision-beyond/
├── src/
│   ├── app/                    # Next.js pages and routes
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── theme/            # Theme components
│   │   ├── hero/             # Landing page components
│   │   ├── features/         # Feature sections
│   │   ├── ml-integration/   # ML components
│   │   ├── dashboard/        # Dashboard components
│   │   └── shared/           # Shared components
│   ├── lib/                  # Utility libraries
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript types
├── ml-models/                # Machine learning models
├── raspberry-pi/             # Raspberry Pi code
└── text-to-speech/          # TTS integration
```

## API Endpoints

- `GET /api/raspberry-pi` - Get camera stream data
- `POST /api/raspberry-pi` - Send control commands
- `POST /api/ml-inference/yolo` - Object detection
- `POST /api/ml-inference/sign-language` - Sign language detection
- `POST /api/text-to-speech` - Convert text to speech
- `GET /api/text-to-speech` - Get available voices
- `GET/POST /api/supabase` - Database operations

## Database Schema

See `src/lib/supabase/schema.sql` for the complete database schema including:
- User profiles and preferences
- Detection records
- Safety alerts
- TTS usage logs
- Session tracking
- Device management
- Analytics summaries

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- YOLO for object detection
- Murf AI for text-to-speech
- Supabase for backend infrastructure
- shadcn/ui for beautiful components
- React Bits for the floating lines animation

## Support

For support, email support@visionbeyond.com or open an issue in the GitHub repository.