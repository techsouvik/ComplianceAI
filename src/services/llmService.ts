import dotenv from 'dotenv';
dotenv.config();

import {GoogleGenerativeAI}  from "@google/generative-ai"
import logger from '../utils/logger';
import generate_promptForCheckingCompliance from '../utils/prompt';

export const checkContentAgainstPolicy = async (pageContent, policyContent) => {
  try {

    // Making the prompt for the LLM
    const prompt = generate_promptForCheckingCompliance(pageContent, policyContent)

    // Making the call to the LLM
    const findings = await gemini_prompt(prompt);
    logger.info(`Findings are: ${findings}`);

    return findings;
  } catch (error) {
    logger.error(`Error in generating findings from the LLM: ${error}`);
    throw error;
  }
};

const gemini_prompt = async (prompt) => {

  
  const apiKey = process.env.LLM_API_KEY as string;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" ,generationConfig:{
        responseMimeType:"application/json"
      } 
    })
  
    try{
      let result = await model.generateContent(prompt);
      // result = result.response.text();
      logger.info(`Result Fetched`)
      return result.response.text();
    } catch (error) {
      logger.error(`Error in fetching result from the LLM: ${error}`);
      throw error;
    }
};
