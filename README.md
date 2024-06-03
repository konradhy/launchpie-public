# LaunchPie

LaunchPie is a platform for startups that allows you to divide equity based on contributions, ensuring clear and fair distribution tied to what each person actually does.

A video demo

## Overview

LaunchPie aims to prevent disputes and misunderstandings among startup founders by making equity distribution transparent and tied to actual contributions. Using the Slicing Pie model, it provides a real-time, automated solution for equitable equity distribution.

Check out my video demo:

[![LaunchPie Demo](https://img.youtube.com/vi/ja1X9c04fks/0.jpg)](https://youtu.be/ja1X9c04fks)

## Key Features

- **Real-Time Equity Dashboard**: Shows up-to-date equity stakes and contributions.
- **Contribution Tracking**: Users log contributions, which then adjust equity shares automatically.
- **Document Management**: Simplifies document upload and provides instant summaries.
- **Meeting Management**: Supports recording meetings with auto-generated transcriptions and agendas.
- **AI-Enhanced Text Editor**: Aids content creation with dynamic, AI-generated assistance.
- **Interactive Chatbot**: Offers quick access to company info, tasks, and documents.
- **Efficient Data Handling**: Employs Convex for data storage, retrieval, and live updates.
- **Equity Distribution Calculations**: Applies the Slicing Pie model for fair, real-time equity adjustments.

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS, Shadcn
- **Backend**: Convex
- **Automation & AI**: OpenAI, Replicate, WhisperAI
- **Data Visualization**: NivoCharts
- **Text Editor**: Blocknote

## Getting Started

To recreate LaunchPie, you will need to:

1. **Create Accounts**:
   - [Clerk](https://clerk.dev)
   - [Convex](https://convex.dev)

2. **Set Up Authentication**:
   - Follow the [Convex documentation](https://docs.convex.dev) for setting up authentication.

3. **Obtain API Keys**:
   - OpenAI
   - Replicate
   - TogetherAPI

4. **Add API Keys to Convex Dashboard**.

5. **Deploy on Vercel**:
   - Configure `CONVEX_DEPLOYKEY`, `CLERK_PUBLISH_KEY`, and `NEXT_PUBLIC_HOSTNAME`.

## Installation
1. Clone the repo
2. Install dependencies
3. Configure convex and clerk 
4. Create a .env.local in the root of project for environment variables
5. Run npm run dev and npx convex dev
6. open in localhost:3000

## Acknowledgments
LaunchPie won the Best Overall App award at the [Devpost Convex AI Competition](https://devpost.com/software/launchpie).

