// import {
//   fetchMunicipalities,
//   fetchMunicipalityCords,
//   setMunicipality,
// } from "@/server/services/municipality/server";
// import {
//   setProject,
//   setProjectCategory,
// } from "@/server/services/project/server";

import { db } from "../server/db";
import data from "./data.json";
import { ulid } from "ulid";

async function setAdmin(nickname: string) {
  const existingUser = await db
    .selectFrom("user")
    .where("nickname", "=", nickname)
    .selectAll()
    .executeTakeFirst();

  if (existingUser) return;

  return db.insertInto("user").values({ id: ulid(), nickname }).execute();
}

const main = async () => {
  // Set admin user
  await setAdmin("mariacincobasicos2025");
  await setAdmin("marcelacincobasicos2025");

  // // Set municipality
  // const municipalities = await fetchMunicipalities({ id: "SP" });
  // const guaruja = municipalities.find((m) => m.nome === "GUARUJÁ");

  // if (!guaruja) throw new Error("Guarujá not found");

  // const cords = await fetchMunicipalityCords({
  //   name: guaruja.nome,
  //   state: "SP",
  // });

  // if (!cords) throw new Error("Cords not found");

  // const municipality = await setMunicipality(db, {
  //   name: guaruja.nome,
  //   state: "SP",
  //   latitude: cords.latitude,
  //   longitude: cords.longitude,
  // });

  // // Set categories and projects
  // for (const project of Object.values(data.dataCords)) {
  //   const categoryName = project["Categoria do equipamento"].trim();
  //   const category = await setProjectCategory(db, { name: categoryName });

  //   const exists = await db
  //     .selectFrom("project")
  //     .selectAll()
  //     .where("name", "=", project["Nome do equipamento"].trim())
  //     .executeTakeFirst();

  //   if (exists) {
  //     console.log(
  //       `Project ${project["Nome do equipamento"].trim()} already exists`
  //     );
  //     continue;
  //   }

  //   await setProject(db, {
  //     name: project["Nome do equipamento"].trim(),
  //     categoryId: category.id,
  //     municipalityId: municipality.id,
  //     responsibleName: project["Nome completo"].trim(),
  //     responsibleRole:
  //       project[
  //         "Seu cargo no equipamento sobre o qual você está respondendo: "
  //       ].trim(),
  //     responsiblePhone: project["Telefone (WhatsApp)"].toString().trim(),
  //     responsibleEmail: "-",
  //     addressStreet: project["Endereço: RUA"].trim(),
  //     addressNumber: project["Endereço: NÚMERO"].toString().trim(),
  //     addressZipCode: project["Endereço: CEP"].toString().trim(),
  //     latitude: project.cords.lat,
  //     longitude: project.cords.lng,
  //   });
  // }

  console.log("Bootstrapped completed");
  process.exit(0);
};

main();
