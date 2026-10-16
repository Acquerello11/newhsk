import type { LayoutServerLoad } from './$types';
import { hasUserConsent } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const user = locals.user;
	const isRegistration = cookies.get('registration_consent') === '1';
	const showRegistrationConsent = Boolean(
		isRegistration &&
		user &&
		!user.isAdmin &&
		!user.isImpersonated &&
		!(await hasUserConsent(String(user.id)))
	);
	return { user, showRegistrationConsent };
};
