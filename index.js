const axios = require('axios');
const nodemailer = require('nodemailer');

exports.getRecipesAndSendEmail = async () => {
    const apiKey = process.env.CHAT_GPT_KEY;
    const emailUser = process.env.AI_CHEF_EMAIL;
    const emailPass = process.env.AI_CHEF_EMAIL_PASS;
    const adjectives = ['healthy', 'nutritious', 'nourishing', 'wholesome', 'satisfying', 'filling', 'hearty'];

    const apiURL = 'https://api.openai.com/v1/completions';

    const body = {
      max_tokens: 1500,
      n: 1,
      model:'text-davinci-003',
      stop: null,
      temperature: 0.7,
    };

    const headers = {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }
    };

    body.prompt = `List 5 ${adjectives[(Math.floor(Math.random() * adjectives.length))]} family dinner recipes as a valid JSON array. 
    Each object should have 3 elements name which is a short string, instructions which is a paragraph with no punctuation or newline characters
    and ingredients which is an array of strings`;
    
    let recResponse;
    try {
      recResponse = await axios.post(apiURL, body, headers);            
    } catch (error) {
      console.error(`Recipe request failed ${error.code}`);
    }
    
    if (!recResponse) throw new Error('No Response on Recipe Request');
    
    const responseString = recResponse.data.choices[0].text.replace(/\./g, '');
    
    let recipesArray;
    try {
      recipesArray = JSON.parse(responseString);
    } catch (error) {
      console.log(`JSON response parsing failed ${error}`);
      console.log(responseString);
      return 0;
    }    
    
    let listResponse;
    body.prompt = `Consolidate the ingredients of the following recipes into a single list: 
    ${recipesArray.map(item => item.ingredients)} 
    add quantities of like elements together into a single element each element should be on it's own line`;
    
    try {
      listResponse = await axios.post(apiURL, body, headers);            
    } catch (error) {
      console.error(`List request failed ${error.code}`);
    }

    let emailText = '';
    
    recipesArray.forEach(menuItem => {
      emailText += menuItem.name + '\n';
      emailText += menuItem.instructions + '\n';
      emailText += menuItem.ingredients.join('\n');
      emailText += '\n\n';
    });

    emailText += 'Shopping List:';
    emailText += listResponse.data.choices[0].text;

    console.log('Email text complete');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailUser, pass: emailPass }
    });

    // Send the shopping list to the specified email address
    const mailOptions = {
        from: emailUser,
        to: process.env.AI_CHEF_EMAIL_TARGETS,
        subject: `Dinner Ideas ${new Date().toLocaleDateString('en-us', { weekday:"long", month:"short", day:"numeric"})}`,
        text: emailText
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};
