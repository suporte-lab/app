import { db } from "@/server/db";
import {
  fetchMunicipalities,
  fetchMunicipalityCords,
  setMunicipality,
} from "@/server/services/municipality/server";
import {
  setProject,
  setProjectCategory,
} from "@/server/services/project/server";

import data from "./data.json";
import { ulid } from "ulid";

const main = async () => {
  // Set admin user
  await db
    .insertInto("user")
    .values({
      id: ulid(),
      nickname: "mariacincobasicos2025",
      role: "admin",
      password: "",
    })
    .execute();

  await db
    .insertInto("user")
    .values({
      id: ulid(),
      nickname: "marcelacincobasicos2025",
      role: "admin",
      password: "",
    })
    .execute();

  // Set municipality
  const municipalities = await fetchMunicipalities({ id: "SP" });
  const guaruja = municipalities.find((m) => m.nome === "GUARUJÁ");

  if (!guaruja) throw new Error("Guarujá not found");

  const cords = await fetchMunicipalityCords({
    name: guaruja.nome,
    state: "SP",
  });

  if (!cords) throw new Error("Cords not found");

  const municipality = await setMunicipality(db, {
    name: guaruja.nome,
    state: "SP",
    latitude: cords.latitude,
    longitude: cords.longitude,
  });

  // Set categories and projects
  for (const project of Object.values(data.dataCords)) {
    const categoryName = project["Categoria do equipamento"].trim();
    const category = await setProjectCategory(db, { name: categoryName });

    const exists = await db
      .selectFrom("project")
      .selectAll()
      .where("name", "=", project["Nome do equipamento"].trim())
      .executeTakeFirst();

    if (exists) {
      console.log(
        `Project ${project["Nome do equipamento"].trim()} already exists`
      );
      continue;
    }

    await setProject(db, {
      name: project["Nome do equipamento"].trim(),
      categoryId: category.id,
      municipalityId: municipality.id,
      responsibleName: project["Nome completo"].trim(),
      responsibleRole:
        project[
          "Seu cargo no equipamento sobre o qual você está respondendo: "
        ].trim(),
      responsiblePhone: project["Telefone (WhatsApp)"].toString().trim(),
      responsibleEmail: "-",
      addressStreet: project["Endereço: RUA"].trim(),
      addressNumber: project["Endereço: NÚMERO"].toString().trim(),
      addressZipCode: project["Endereço: CEP"].toString().trim(),
      latitude: project.cords.lat,
      longitude: project.cords.lng,
    });
  }

  console.log("Bootstrapped completed");
  process.exit(0);
};

function getDataQuestions() {
  const blacklist = [
    "Carimbo de data/hora",
    "Nome completo",
    "Seu cargo no equipamento sobre o qual você está respondendo: ",
    "Telefone (WhatsApp)",
    "Nome do equipamento",
    "Endereço: RUA",
    "Endereço: NÚMERO",
    "Endereço: CEP",
    "Categoria do equipamento",
    "cords",
  ];

  const questions: Record<
    string,
    {
      type: string;
      options?: string[];
      answers: {
        projectName: string;
        answer: string | number;
      }[];
    }
  > = {};

  for (const item of Object.values(data.dataCords)) {
    for (let [key, value] of Object.entries(item)) {
      if (blacklist.includes(key)) continue;

      if (typeof value == "number") {
        questions[key] = {
          type: "number",
          answers: [
            ...(questions[key]?.answers ?? []),
            { projectName: item["Nome do equipamento"].trim(), answer: value },
          ],
        };
      } else {
        questions[key] = {
          type: "text",
          options: Array.from(
            new Set([...(questions[key]?.options ?? []), value.trim()])
          ),
          answers: [
            ...(questions[key]?.answers ?? []),
            {
              projectName: item["Nome do equipamento"].trim(),
              answer: value.trim(),
            },
          ],
        };
      }
    }
  }

  for (const [key, value] of Object.entries(questions)) {
    console.log(key, value);
  }

  process.exit(0);
}

// getDataQuestions();

main();
