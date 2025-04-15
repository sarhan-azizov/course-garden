export const checkEnvironmentVariables = () => {
  const requiredVariables = [
    'API_PORT',

    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',

    'AUTH0_ISSUER_BASE_URL',

    'CLIENT_URL',
  ];

  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable],
  );

  if (missingVariables.length) {
    throw new Error(
      `Missing environment variables: ${missingVariables.join(', ')}`,
    );
  }
};
