window.onload = function onload() {
    document.getElementById("answers").innerHTML = null

    let url = new URLSearchParams(window.location.search).get("furl")
    document.getElementById("furl").value = url
    if (url === "") {
        return
    }
    // url = "https://app.senecalearning.com/classroom/course/4cb62f70-25d5-11e8-997c-45e9415ece8c/section/9a95a0ac-a87e-4073-a745-a5d94954d313/session"
    let course = /(?<=https:\/\/app\.senecalearning\.com\/classroom\/course\/)(.*)(?=\/section\/)/.exec(url)[0]
    let section = /(?<=\/section\/)(.*)(?=\/session)/.exec(url)[0]

    let answers = fetch_answers(course, section)
    answers.then(answers => {
        document.getElementById("answers").innerHTML = generate_answers(answers)
    })
}

async function fetch_answers(course, section) {
    return fetch(`https://course.app.senecalearning.com/api/courses/${course}/signed-url?sectionId=${section}`, {
        headers: {
            correlationId: "1645980974364::c14d5fa2c03d21f9f17029f442096a61"
        }
    })
        .then(response => response.json())
        .then(data => data["url"])
        .then(async url => {
            return await fetch(url)
                .then(response => response.json())
        })
}

function generate_answers(answers) {
    let title = answers["title"]
    let questions = ""

    answers["contents"].forEach(content => {
        questions += `
        <div class="content">
            <h3>${content["tags"][0]}</h3>
        `

        content["contentModules"].forEach(question => {
            let res = ""
            switch (question["moduleType"]) {
                case "wordfill":
                    question["content"]["words"].forEach(answer_part => {
                        if (typeof answer_part === "string") {
                            res += answer_part
                        } else {
                            res += `<b>${answer_part["word"]}</b>`
                        }
                    })
                    questions += `
                    <div class="question">
                        <p>${res}</p>
                    </div>
                    `
                    break
                case "multiple-choice":
                    questions += `
                    <div class="question">
                        <p>${question["content"]["question"]}</p>
                        <b>${question["content"]["correctAnswer"]}</b>
                    </div>                
                    `
                    break
                case "list":
                    res += "<ul>"
                    question["content"]["values"].forEach(answer_part => {
                        res += "<li>"
                        answer_part["value"].forEach(answer => {
                            if (typeof answer === "string") {
                                res += answer
                            } else {
                                res += `<b>${answer["word"]}</b>`
                            }
                        })
                        res += "</li>"
                    })
                    res += "</ul>"

                    if (question["content"]["pretestQuestion"] !== undefined) {
                    questions += `
                    <div class="question">
                        <p>${question["content"]["pretestQuestion"]}</p>
                        <b>${question["content"]["prestestCorrectAnswer"]}</b>
                    </div>
                    `
                    }
                    questions += `
                    <div class="question">
                        <p>${question["content"]["statement"]}</p>
                        ${res}
                    </div>
                    `
                    break
                case "mindmap":
                    if (question["content"]["pretestQuestion"] !== undefined) {
                        questions += `
                        <div class="question">
                            <p>${question["content"]["pretestQuestion"]}</p>
                            <b>${question["content"]["prestestCorrectAnswer"]}</b>
                        </div>
                        `
                    }

                    res = "<ul>"
                    question["content"]["values"].forEach(answer_part => {
                        res += "<li>"
                        answer_part["value"].forEach(answer => {
                            if (typeof answer === "string") {
                                res += answer
                            } else {
                                res += `<b>${answer["word"]}</b>`
                            }
                        })
                        res += "</li>"
                    })
                    res += "</ul>"

                    questions += `
                    <div class="question">
                        <p>${question["content"]["statement"]}</p>
                        ${res}
                    </div>
                    `
                    break
                case "toggles":
                    res += "<ul>"
                    question["content"]["toggles"].forEach(toggle => {
                        res += `<li><b>${toggle["correctToggle"]}</b></li>`
                    })
                    res += "</ul>"

                    questions += `
                    <div class="question">
                        <p>${question["content"]["statement"]}</p>
                        ${res}
                    </div>
                    `
                    break
                case "worked-example":
                    if (question["content"]["question"] !== undefined) {
                        questions += `
                        <div class="question">
                            <p>${question["content"]["question"]}</p>
                        `
                    }
                    question["content"]["steps"].forEach(step => {
                        res = ""
                        step["equation"].forEach(part => {
                            if (typeof part === "string") {
                                res += part
                            } else {
                                res += `<b>${part["word"]}</b>`
                            }
                        })
                        if (step["instruction"] !== undefined) {
                            questions += `
                            <div class="question">
                                <p>${step["instruction"]}</p>
                                <p>${res}</p>
                            </div>
                            <br>
                            `
                        } else {
                            questions += `
                            <p>${res}</p>
                            `
                        }
                    })

                    if (question["content"]["question"] !== undefined) {
                        questions += "</div>"
                    }

                    break
                case "multiSelect":
                    res += "<ul>"
                    question["content"]["options"].forEach(option => {
                        if (option["correct"] === true) {
                            res += `<li>${option["text"]}</li>`
                        }
                    })
                    res += "</ul>"

                    questions += `
                    <div class="question">
                        <p>${question["content"]["question"]}</p>
                        ${res}
                    </div>
                    `
                    break
                case "exact-list":
                    res += "<ul>"
                    question["content"]["values"].forEach(value => {
                        res += `<li>${value["value"][0]["word"]}</li>`
                    })
                    res += "</ul>"

                    questions += `
                    <div class="question">
                        <p>${question["content"]["statement"]}</p>
                        ${res}
                    </div>
                    `
                    break
                case "wrong-word":
                    question["content"]["sentence"].forEach(part => {
                        if (typeof part === "string") {
                            res += part
                        } else {
                            res += `<b>${part["word"]}</b>`
                        }
                    })

                    questions += `
                    <div class="question">
                        <p>${res}</p>
                    </div>
                    `
                    break
                case "flow":
                    res += "<ul>"
                    question["content"]["orderedValues"].forEach(value => {
                        res += `<li>${value}</li>`
                    })
                    res += "</ul>"

                    questions += `
                    <div class="question">
                        <p>${question["content"]["title"]}</p>
                        ${res}
                    </div>
                    `
                    break
                case "grid":
                    res += "<ul>"
                    question["content"]["definitions"].forEach(definition => {
                        res += `<li>${definition["word"]}: ${definition["text"]}</li>`
                    })
                    res += "</ul>"

                    questions += `
                    <div class="question">
                        <p>${question["content"]["title"]}</p>
                        ${res}
                    </div>
                    `
            }
        })
        questions += `
        </div>
        `
    })

    return `
    <h1>${title}</h1>
    ${questions}
    `
}
