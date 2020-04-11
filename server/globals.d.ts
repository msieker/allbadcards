type TransportStream  = import('winston-transport');

declare module "winston-loggly-bulk"
{
	export interface ILogglyParams
	{
		token: string,
		subdomain: string;
		tags: string[];
		json: boolean
	}

	export const Loggly: any;
}