#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🔧 Setting up environment variables for deployment...\n');

  try {
    // Get Gemini API Key
    const geminiKey = await question('Enter your Gemini API Key (starts with "AI..."): ');
    if (!geminiKey || !geminiKey.startsWith('AI')) {
      console.log('❌ Invalid Gemini API key format');
      process.exit(1);
    }

    // Ask about video generation service
    console.log('\n🎬 Video Generation Service Configuration');
    console.log('==========================================');
    console.log('1. Daytona (Recommended - $200 free credit)');
    console.log('2. Replicate (Pay per video)');
    console.log('3. RunPod (GPU-powered)');
    console.log('4. Mock videos only (for testing)');
    
    const serviceChoice = await question('\nChoose video generation service (1-4): ');

    let daytonaUrl = '';
    let replicateToken = '';
    let runpodKey = '';
    let runpodEndpoint = '';

    switch (serviceChoice) {
      case '1':
        // Daytona configuration
        console.log('\n🚀 Daytona Configuration');
        console.log('========================');
        console.log('First, set up your Daytona sandbox:');
        console.log('1. Run: cd daytona-sandbox && ./setup-daytona.sh');
        console.log('2. Get your sandbox URL from the output');
        
        daytonaUrl = await question('\nEnter your Daytona sandbox URL (e.g., https://your-sandbox.daytona.io): ');
        if (!daytonaUrl || !daytonaUrl.startsWith('http')) {
          console.log('❌ Invalid Daytona URL');
          process.exit(1);
        }
        break;

      case '2':
        // Replicate configuration
        console.log('\n🔄 Replicate Configuration');
        console.log('==========================');
        console.log('Get your API token from: https://replicate.com/account/api-tokens');
        
        replicateToken = await question('Enter your Replicate API token: ');
        if (!replicateToken) {
          console.log('❌ Replicate token is required');
          process.exit(1);
        }
        break;

      case '3':
        // RunPod configuration
        console.log('\n⚡ RunPod Configuration');
        console.log('=======================');
        console.log('Get your API key from: https://runpod.io/console/user/settings');
        
        runpodKey = await question('Enter your RunPod API key: ');
        runpodEndpoint = await question('Enter your RunPod endpoint ID: ');
        
        if (!runpodKey || !runpodEndpoint) {
          console.log('❌ RunPod credentials are required');
          process.exit(1);
        }
        break;

      case '4':
        console.log('\n🎭 Using mock videos only (for testing)');
        break;

      default:
        console.log('❌ Invalid choice, using mock videos');
        break;
    }

    console.log('\n🚀 Setting environment variables in Vercel...');

    // Set Gemini API Key
    try {
      execSync(`echo "${geminiKey}" | vercel env add GEMINI_API_KEY production`, { stdio: 'inherit' });
      console.log('✅ GEMINI_API_KEY set');
    } catch (error) {
      console.log('⚠️  GEMINI_API_KEY might already exist, updating...');
      execSync(`vercel env rm GEMINI_API_KEY production -y`, { stdio: 'pipe' });
      execSync(`echo "${geminiKey}" | vercel env add GEMINI_API_KEY production`, { stdio: 'inherit' });
    }

    // Set video generation service variables
    if (daytonaUrl) {
      try {
        execSync(`echo "${daytonaUrl}" | vercel env add DAYTONA_SANDBOX_URL production`, { stdio: 'inherit' });
        console.log('✅ DAYTONA_SANDBOX_URL set');
      } catch (error) {
        console.log('⚠️  DAYTONA_SANDBOX_URL might already exist, updating...');
        execSync(`vercel env rm DAYTONA_SANDBOX_URL production -y`, { stdio: 'pipe' });
        execSync(`echo "${daytonaUrl}" | vercel env add DAYTONA_SANDBOX_URL production`, { stdio: 'inherit' });
      }
    }

    if (replicateToken) {
      try {
        execSync(`echo "${replicateToken}" | vercel env add REPLICATE_API_TOKEN production`, { stdio: 'inherit' });
        console.log('✅ REPLICATE_API_TOKEN set');
      } catch (error) {
        console.log('⚠️  REPLICATE_API_TOKEN might already exist, updating...');
        execSync(`vercel env rm REPLICATE_API_TOKEN production -y`, { stdio: 'pipe' });
        execSync(`echo "${replicateToken}" | vercel env add REPLICATE_API_TOKEN production`, { stdio: 'inherit' });
      }
    }

    if (runpodKey) {
      try {
        execSync(`echo "${runpodKey}" | vercel env add RUNPOD_API_KEY production`, { stdio: 'inherit' });
        console.log('✅ RUNPOD_API_KEY set');
      } catch (error) {
        console.log('⚠️  RUNPOD_API_KEY might already exist, updating...');
        execSync(`vercel env rm RUNPOD_API_KEY production -y`, { stdio: 'pipe' });
        execSync(`echo "${runpodKey}" | vercel env add RUNPOD_API_KEY production`, { stdio: 'inherit' });
      }

      try {
        execSync(`echo "${runpodEndpoint}" | vercel env add RUNPOD_ENDPOINT_ID production`, { stdio: 'inherit' });
        console.log('✅ RUNPOD_ENDPOINT_ID set');
      } catch (error) {
        console.log('⚠️  RUNPOD_ENDPOINT_ID might already exist, updating...');
        execSync(`vercel env rm RUNPOD_ENDPOINT_ID production -y`, { stdio: 'pipe' });
        execSync(`echo "${runpodEndpoint}" | vercel env add RUNPOD_ENDPOINT_ID production`, { stdio: 'inherit' });
      }
    }

    console.log('\n📝 Setup complete!');
    
    if (serviceChoice === '1') {
      console.log('🎬 Daytona integration configured - you can now generate real MP4 videos!');
      console.log('💰 Free tier: $200 credit (~4000-20000 videos)');
    } else if (serviceChoice === '2') {
      console.log('🔄 Replicate integration configured - pay per video generation');
    } else if (serviceChoice === '3') {
      console.log('⚡ RunPod integration configured - GPU-powered video generation');
    } else {
      console.log('🎭 Mock videos configured - for testing only');
    }

    console.log('\n✅ Environment variables configured successfully!');
    console.log('\n🚀 Ready to deploy! Run: npm run deploy');

  } catch (error) {
    console.error('❌ Error setting up environment:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();