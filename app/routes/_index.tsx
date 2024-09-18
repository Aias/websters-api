import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
	return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

const title = `Webster's 1913 API`;

export default function Index() {
	return (
		<div className='flex h-screen items-center justify-center'>
			<h1 className='text-4xl font-bold'>{title}</h1>
		</div>
	);
}
