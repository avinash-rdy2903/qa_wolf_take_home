// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function saveHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Added a command line argument to take different number of articles to be processed
  const articleCount = parseInt(process.argv[2],10) || 100;


  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  // since Hacker News displays only 30 articles per page, we need to visit the website until page 4.
  async function loadMoreArticles() {
    const moreButton = await page.$('a.morelink');
    if (moreButton) {
      await moreButton.click();
      await page.waitForTimeout(2000); // Wait for the new articles to load
    }
  }

  // Collect articles until we have at least the desired number and Extract the submission times of the specified number of articles
  let totalProcessed = 0;
  const submissionTimes = [];
  while (totalProcessed < articleCount) {
    
    articles = await page.$$('.athing+tr');
    let loopLimiter = articleCount-totalProcessed<articles.length?articleCount-totalProcessed:articles.length;
    for (let i = 0; i < loopLimiter; i++) {
      let timeElement = await articles[i].$('span.age');
      let time = await timeElement.getAttribute('title');
      submissionTimes.push(new Date(time));
    }
    totalProcessed+=loopLimiter;
    if (totalProcessed < articleCount) {
      await loadMoreArticles();
    }
  }
  delete articles
  

  // Validate if the articles are sorted from newest to oldest
  let sorted = true;
  let notSortedInd = [];
  for (let i = 1; i < articleCount; i++) {
    if (submissionTimes[i] > submissionTimes[i - 1]) {
      sorted = false;
      console.log(`${[submissionTimes[i] , submissionTimes[i - 1], i]}`)
      notSortedInd.push([i-1,i]);
      // break;
    }
  }

  if (sorted) {
    console.log(`The first ${articleCount} articles are sorted from newest to oldest.`);
  } else {
    console.log(`The first ${articleCount} articles are NOT sorted from newest to oldest.`);
    console.log(`Articles ${notSortedInd.map((e)=>`(${e[0]},${e[1]})`).join(",")} are out of order`);
  }

  // Close the browser
  await browser.close();
}

(async () => {
  await saveHackerNewsArticles();
})();
