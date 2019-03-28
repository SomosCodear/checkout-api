import * as Knex from "knex";

exports.seed = async (knex: Knex): Promise<any> => {
  const customers = [
    [
      "e712aeeb-a2c7-4256-9327-0233933724b8",
      "Persona Felizenlaconf",
      null,
      null,
      null,
      null,
      "DNI",
      "12345678",
      "personafeliz@gmail.com"
    ]
  ];

  return Promise.all(
    customers.map(
      ([
        id,
        fullName,
        dateOfBirth,
        city,
        state,
        country,
        identificationType,
        identificationNumber,
        emailAddress
      ]) =>
        knex("Customers").insert({
          id,
          fullName,
          dateOfBirth,
          city,
          state,
          country,
          identificationType,
          identificationNumber,
          emailAddress
        })
    )
  );
};
