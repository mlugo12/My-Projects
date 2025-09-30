// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const chalk = require("chalk");  //npm install chalk@4.1.2
const fs = require("fs");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  // get all articles
  const articles = await page.$$(".athing");
  const subtexts = await page.$$(".subtext");

  // get first article and its subtext
  const article = articles[0];
  const subtext = subtexts[0];

  
  // create an array to hold article data
  const articleData = [];

  // collect first 100 articles

  for (let i = 0; i < Math.min(100, articles.length); i++) {
    const article = articles[i];
    const subtext = subtexts[i];

    const titleElement = await article.$(".titleline > a");
    const title = await titleElement.innerText();
    
    const rankElement = await article.$(".rank");
    const rankText = await rankElement.innerText();
    const rank = parseInt(rankText.replace(".", ""), 10);

    const ageElement = await subtext.$(".age");
    const ageText = await ageElement.getAttribute("title");
    const agedata = ageText.split(" ")[0]; // get only the number part
    const age = agedata.replace("T", " ");

    articleData.push({ title, rank, age });

    // if there is a "More" link, click it to load more articles
    if (i === articles.length - 1) {
      const moreLink = await page.$("a.morelink");
      if (moreLink) {
        await Promise.all([
          moreLink.click(),
        ]);

        // get new articles and subtexts
        const newArticles = await page.$$(".athing");
        const newSubtexts = await page.$$(".subtext");
        articles.push(...newArticles);
        subtexts.push(...newSubtexts);
      }
    }
  }


  (async () => {
    await sortHackerNewsArticles();
  })();


  async function validateSortedArticles(articleData) {
    let isSorted = true;

    for (let i = 0; i < articleData.length - 50; i++) {
      const current = articleData[i];
      const next = articleData[i + 1];
      const d1 = new Date(articleData[i].age);
      const d2 = new Date(articleData[i + 1].age);
      

      if (d1 < d2) {
        console.error(`Articles are not sorted correctly: ${current.title} (age: ${current.age}) < ${next.title} (age: ${next.age})`);
        isSorted = false;
        break; 
      }
    }

    if (isSorted === true){
    console.log(chalk.green("Articles are sorted correctly by age."));
    } else {
      console.log(chalk.red("Articles are NOT sorted correctly by age."));
    }

  }

  // log sorted articles
  console.table(articleData);
  
  await validateSortedArticles(articleData);

  //fs.writeFileSync("articleData.json", JSON.stringify(articleData, null, 2));
  //console.log(chalk.green("Article data saved to articleData.json"));
  await browser.close();

  const rows = articleData

  .map(
    (a) => `
    <tr>
      <td>${a.rank}</td>
      <td>${a.title}</td>
      <td>${a.age}</td>
    </tr>`
  )
  .join("\n");

  const timestamp = new Date().toLocaleString();

  // Full HTML file
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title> Sorted Hacker News Articles</title>
    <style>
      body { font-family: Arial, sans-serif; }
      .timestamp { text-align: center; margin-top: 10px; font-size: 0.9em; color: #555; }
      table { border-collapse: collapse; width: 80%; margin: 20px auto; }
      th, td { border: 1px solid #999; padding: 8px 12px; text-align: left; }
      th { background: #e2e2dcff; }
      h2 { text-align: center; }
    </style>
  </head>
  <body>
    <h2>Sorted Hacker News Articles</h2>
    <div class="timestamp">Last updated: ${timestamp}</div>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Title</th>
          <th>Age</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </body>
</html>`;

  fs.writeFileSync("articles.html", html);
  console.log("✅ File generated: articles.html");

}

sortHackerNewsArticles();

//https://qawolf.notion.site/Mission-and-Values-859c7d0411ba41349e1b318f4e7abc8f 