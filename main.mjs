import { getPublicationsByYear, getUserID } from "./functions.mjs";

async function main() {
  const authorName = "David Anastasiu";

  const userID = await getUserID(authorName);
  if (!userID) {
    console.error("User ID not found for", authorName);
    return;
  }
  const publications = await getPublicationsByYear(userID, 2023);
  publications.forEach((publication) => {
    console.log(publication.title);
  });
}

main();
