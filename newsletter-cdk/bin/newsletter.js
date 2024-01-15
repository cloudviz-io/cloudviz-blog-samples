import { App } from 'aws-cdk-lib';
import { NewsletterCdkStack } from '../lib/newsletter-stack.js';
import { resourceName } from './app-config.js';

const app = new App();

// See more about defining environments: https://docs.aws.amazon.com/cdk/v2/guide/environments.html
new NewsletterCdkStack(app, resourceName('demo'), {  stage: 'demo', env: { region: 'eu-west-1' } });