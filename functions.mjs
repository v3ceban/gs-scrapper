import axios from "axios";
import cheerio from "cheerio";

export async function getUserID(authorName) {
  try {
    const searchUrl = `https://scholar.google.com/citations?view_op=search_authors&mauthors=${encodeURIComponent(authorName)}`;
    const response = await axios.get(searchUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const authorProfileLink = $("a.gs_ai_pho").attr("href");

    if (authorProfileLink) {
      const userIdMatch = authorProfileLink.match(/user=([^&]+)/);
      if (userIdMatch) {
        return userIdMatch[1];
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching Google Scholar user ID:", error);
    return null;
  }
}

export async function getPublicationsByYear(
  userID,
  year = new Date().getFullYear(),
) {
  try {
    const profileUrl = `https://scholar.google.com/citations?hl=en&user=${encodeURIComponent(userID)}&view_op=list_works&sortby=pubdate`;
    const response = await axios.get(profileUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const publications = [];
    $("tr.gsc_a_tr").each((index, element) => {
      const publicationYear = $(element).find("td.gsc_a_y").text();
      if (publicationYear === year.toString()) {
        const title = $(element).find("a.gsc_a_at").text();
        const url = `https://scholar.google.com${$(element).find("a.gsc_a_at").attr("href")}`;
        publications.push({ title, url });
      }
    });

    for (const publication of publications) {
      const info = await getPublicationInfo(publication.url);
      Object.assign(publication, info);
    }

    return publications;
  } catch (error) {
    console.error("Error fetching Google Scholar publications:", error);
    return [];
  }
}

async function getPublicationInfo(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const info = {};
    $("div.gsc_oci_field").each((index, element) => {
      const field = $(element)
        .text()
        .toLowerCase()
        .trim()
        .replace(/[^\x20-\x7E]/g, "");
      const value = $(element)
        .next("div.gsc_oci_value")
        .text()
        .trim()
        .replace(/[^\x20-\x7E]/g, "");
      info[field] = value;
    });

    return info;
  } catch (error) {
    console.error("Error fetching publication info:", error);
    return {};
  }
}
