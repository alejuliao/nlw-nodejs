import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { SurveysRepository } from '../repositories/SurveysRepository';
import { SurveyUsersRepository } from '../repositories/SurveysUsersRepository';
import { UsersRepository } from '../repositories/UserRespository';
import SendMailService from '../services/SendMailService';
import { resolve } from 'path';


class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const userRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveyUsersRepository);

    const user = await userRepository.findOne({ email });
    
    const npsPath = resolve(__dirname, "..","views", "emails", "npsMail.hbs")
    if (!user) {
      return response.status(400).json({
        error: "User does not exists!",
      });
    }
    const survey = await surveysRepository.findOne({ id: survey_id })
    const variables = {
      name: user.name,
      title:survey.title,
      description: survey.description,
      user_id: user.id,
      link: process.env.URL_MAIL
    }
    
    if (!survey) {
      return response.status(400).json({
        error: "Survey does not Exists!"
      })
    }
    
    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where:{user_id: user.id, value:null},
      relations:["user", "survey"],
    })

    if(surveyUserAlreadyExists){
      await SendMailService.execute(email, survey.title, variables, npsPath)
      return response.json(surveyUserAlreadyExists)
    }

    // 01 Save data
    const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id,
    })
    
    await surveysUsersRepository.save(surveyUser);
    //02 send data

    

    await SendMailService.execute(email, survey.title, variables, npsPath)
    return response.json(surveyUser)
  }
}

export { SendMailController };
