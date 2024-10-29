const HF_API_KEY = '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';

export async function generateText(prompt: string): Promise<string> {
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<s>[INST] ${prompt} [/INST]`,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            top_p: 0.95,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate text');
    }

    const result = await response.json();
    return result[0].generated_text.split('[/INST]')[1]?.trim() || 'I apologize, but I couldn\'t generate a response. Please try again.';
  } catch (error) {
    console.error('Text generation error:', error);
    throw new Error('Failed to generate text');
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: 'blurry, bad quality, distorted',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error('Failed to generate image');
  }
}