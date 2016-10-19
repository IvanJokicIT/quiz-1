//vars for REQUIRE
var yo = require('yo-yo')
var minixhr = require('minixhr')
var csjs = require('csjs-inject')
var chart = require('chart.js')
//colours and font
var font = 'Josefin Slab, serif;'
var blue = 'rgba(1, 22, 39, 1)' //maastricht blue
var white = 'rgba(253, 255, 252, 1)' //baby powder
var teal = 'rgba(46, 196, 182, 1)' //maximum blue green
var red = 'rgba(231, 29, 54, 1)' //rose madder
var yellow  = 'rgba(255, 159, 28, 1)' //bright yellow
/*-----------------------------------------------------------------------------
  LOADING FONT
-----------------------------------------------------------------------------*/
var links = ["https://fonts.googleapis.com/css?family=Cabin+Sketch:700|Josefin+Slab", "https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css"];
var font = yo`<link href=${links[0]} rel='stylesheet' type='text/css'>`
var fontAwesome = yo`<link href=${links[1]} rel='stylesheet' type='text/css'>`;
document.head.appendChild(font);
document.head.appendChild(fontAwesome);
/*-----------------------------------------------------------------------------
LOADING DATA
-----------------------------------------------------------------------------*/
var questions = [
`
Statement #1:
If I had enough money,
I'd buy myself a spaceship.
`,
`
Statement #2:
My favourite food is chocolate.
`,
`
Statement #3:
I wouldn't know what to do without coffee.
`,
`
Statement #4:
Cats are overrated and evil.
`,
`
Statement #5:
Corgis are the cutest dogs ever!
`,
`
Statement #6:
I deeply regret doing these questions.
`
]
var i               = 0
var question        = questions[i]
var results         = []
var answerOptions   = [1,2,3,4,5]


/*-----------------------------------------------------------------------------
  QUIZ
-----------------------------------------------------------------------------*/
function quizComponent () {
  var css = csjs`
    .quiz {
      background-color: ${blue};
      text-align: center;
      font-family: 'Josefin Slab', serif;
      padding-bottom: 200px;
    }
    .welcome {
      font-size: 4em;
      padding: 50px;
      color: ${yellow};
      font-family: 'Cabin Sketch', cursive;
    }
    .question {
      font-size: 2em;
      color: ${white};
      padding: 40px;
      margin: 0 5%;
    }
    .answers {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      margin: 0 5%;
    }
    .answer {
      background-color: ${teal};
      padding: 15px;
      margin: 5px;
      border: 2px solid ${white};
      border-radius: 20%;
    }
    .answer:hover {
      background-color: ${yellow};
      cursor: pointer;
    }
    .instruction {
      color: ${white};
      font-size: 1.3em;
      margin: 2em;
      padding: 20px;
    }
    .results {
      background-color: ${white};
      text-align: center;
      font-family: 'Josefin Slab', serif;
      padding-bottom: 200px;
    }
    .resultTitle{
      font-size: 4em;
      padding: 50px;
      color: ${blue}
    }
    .back {
      display: flex;
      justify-content: center;
    }
    .backText {
      color: ${white};
      font-size: 25px;
      cursor:pointer;
      margin-top: 1em;
    }
  	.backText:hover {
      color: ${yellow};
    }
    .showChart {
      font-size: 2em;
      color: ${teal};
      margin: 4em;
    }
    .showChart:hover {
      color: ${yellow};
      cursor: pointer;
    }
    .myChart {
      width: 300px;
      height: 300px;
    }
   .madeby {
     margin-top: 4em;
      font-size: 1.2em;
      color: ${white};
    }
    .madeByIcons {
      color: ${teal};
    }

  `


  function template () {
    return yo`
      <div class="${css.quiz}">
        <div class="${css.welcome}">
          Welcome to my Little Quiz! ^-^
        </div>
        <div class="${css.question}">
          ${question}
        </div>
        <div class="${css.answers}">
          ${answerOptions.map(x=>yo`<div class="${css.answer}" onclick=${nextQuestion(x)}>${x}</div>`)}
        </div>
        <div class="${css.instruction}">
          Choose how strongly do you agree with the statement<br>
          ( 1 - strongly disagree, 6 - strongly agree )
        </div>
        <div class="${css.back}" onclick=${back}>
           <div class="${css.backText}">Go back</div>
        </div>
     <div class="${css.madeby}">
            <p>made with  <i class="${css.madeByIcons} fa fa-coffee" aria-hidden="true"></i>  and  <i class="${css.madeByIcons} fa fa-heart" aria-hidden="true"></i>  by Ana</p>
         </div>
      </div>
    `
  }
  var element = template()
  document.body.appendChild(element)

  return element

  function nextQuestion(id) {
  return function () {
    if (i < (questions.length-1)) {
      results[i] = id
      i = i+1
      question = questions[i]
      yo.update(element, template())
    } else {
      results[i] = id
      sendData(results)
      yo.update(element, seeResults(results))
    }
  }
	}

  function seeResults(data) {
  var ctx = yo`<canvas class="${css.myChart}"></canvas>`
  return yo`
    <div class="${css.results}">
      <div class="${css.resultTitle}">
        Compare your answers
      </div>
      <div class="${css.showChart}" onclick=${function(){createChart(ctx, data)}}>
        Click to see the chart
      </div>
        ${ctx}
    </div>
  `
	}

  function back() {
  if (i > 0) {
    i = i-1
    question = questions[i]
    yo.update(element, template())
  }
}
  function sendData(results) {
    var request  = {
      url          : 'https://my-quiz-cfa2b.firebaseio.com/results.json',
      method       : 'POST',
      data         : JSON.stringify(results)
    }
    minixhr(request)
  }
function createChart(ctx, myData) {
    minixhr('https://my-quiz-cfa2b.firebaseio.com/results.json', responseHandler)
    function responseHandler (data, response, xhr, header) {
      var data = JSON.parse(data)
      var keys = Object.keys(data)
      var arrayOfAnswers = keys.map(x=>data[x])
      var stats = arrayOfAnswers.reduce(function(currentResult,answer,i) {
        var newResult=currentResult.map((x,count)=>(x*(i+1)+answer[count])/(i+2))
        return newResult
      }, myData)
      var data = {
        labels: [
          "Statement #1", "Statement #2", "Statement #3",
          "Statement #4", "Statement #5", "Statement #6"
        ],
        datasets: [
          {
            label: "My statments",
            backgroundColor: "rgba(179,181,198,0.2)",
            borderColor: 'rgba(179,181,198, 1)',
            pointBackgroundColor: "rgba(179,181,198,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(179,181,198,1)",
            data: myData
          },
          {
            label: "Others statements",
            backgroundColor: "rgba(255,99,132,0.2)",
            borderColor: "rgba(255,99,132,1)",
            pointBackgroundColor: "rgba(255,99,132,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(255,99,132,1)",
            data: stats
          }
        ]

      }
      var myChart = new Chart(ctx, {
        type: 'radar',
        data: data,
        options: {
          scale: {
            scale: [1,2,3,4,5],
            ticks: {
              beginAtZero: true
            }
          }
        }
      })
    }
}
}
quizComponent()
