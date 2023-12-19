var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

var engine = Engine.create( { gravity: { scale: 0.001 } } );

var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false
    }
});

const WIDTH = render.canvas.width = 300;
const HEIGHT = render.canvas.height = 500;

var detect = Matter.Detector.create();

var fruits = [];

var mouseX;

types = [];

types.push( {
    width: 6,
    color: "#7800ff",
    type: "blueberry",
    force: 1
} );

types.push( {
    width: 6.99,
    color: "#a40000",
    type:  "cherry",
    force: 2
} );

types.push( {
    width: 15,
    color: "green",
    type:  "guava",
    force: 3
} );

types.push( {
    width: 20,
    color: "#ff9300",
    type:  "clementine",
    force: 4
} );

types.push( {
    width: 25,
    color: "red",
    type:  "apple",
    force: 5
} );

types.push( {
    width: 35,
    color: "#ff6969",
    type:  "peach",
    force: 6
} );

types.push( {
    width: 45,
    color:  "#612800",
    type:  "coconut",
    force: 7
} );

types.push( {
    width: 60,
    color:  "#ccff9a",
    type:  "melon",
    force: 8
} );

types.push( {
    width: 80,
    color:  "#e5e200",
    type:  "ananas",
    force: 9
} );

types.push( {
    width: 100,
    color:  "#023e00",
    type:  "watermelon",
    force: 10
} );

var type_now = types[Math.floor(Math.random() * 4)];

var fruit = {
    x : WIDTH/2,
    dy : 0,
    y : 30,
    type: null,
    body: null,
    start: function (arg_type) {
        this.type = arg_type;
        this.body = Bodies.circle(mouseX, 30, this.type.width, { render: { fillStyle: this.type.color }, angle: 1, friction: 0.1, restitution: 0.3/* friction: 0.00001, frictionStatic: 0.5, slop: 0 */ } );
        Composite.add(engine.world, this.body);
        var bodies = [];
        for (let i = 0; i < fruits.length; i++) {
            bodies.push(fruits[i].body);
        }
        Matter.Detector.setBodies(detect, bodies);
    },
    upgrad: function (yA) {
        if (this.type.type !== "watermelon") {
            const aw = this.body.circleRadius;
            const x = this.body.position.x;
            this.type = types[this.type.force];
            this.body = Bodies.circle(x, yA - this.type.width + aw - 5, this.type.width, { render: { fillStyle: this.type.color }, angle: 1, friction: 0.1, restitution: 0.3/* friction: 0.00001, frictionStatic: 0.5, slop: 0 */ } );
        }
    }
};

function collisions_detect_update() {
    const collisions = Matter.Detector.collisions(detect);
    for (let j = 0; j < collisions.length; j++) {
        var idA = collisions[j].bodyA.id;
        var idB = collisions[j].bodyB.id;
        var iA = null, iB = null;
        for (let i = 0; i < fruits.length; i++) {
            if (fruits[i].body.id === idA) {
                iA = i;
            } else if (fruits[i].body.id === idB) {
                iB = i;
            }
        }
        if (typeof(iA) === "number" && typeof(iB) === "number" && fruits[iA].type.type === fruits[iB].type.type) {
            var save = Composite.allBodies(engine.world);
            for (let i = 0; i < save.length; i++) {
                if (idA === save[i].id) {
                    idA = i;
                }
            }
            const yA = fruits[iA].body.position.y;
            save.splice(idA,1);
            fruits.splice(iA, 1);

            for (let i = 0; i < fruits.length; i++) {
                if (fruits[i].body.id === idB) {
                    iB = i;
                }
            }
            for (let i = 0; i < save.length; i++) {
                if (save[i].id === idB) {
                    idB = i;
                }
            }

            if (fruits[iB].type.type === "watermelon") {
                fruits.splice(iB, 1);
                save.splice(idB, 1);
            } else {
                fruits[iB].upgrad(yA);
                save[idB] = fruits[iB].body;
            }

            var save_detect = [];
            for (let i = 0; i < fruits.length; i++) {
                save_detect.push(fruits[i].body);
            }

            Composite.clear(engine.world);
            Composite.add(engine.world, save);

            Matter.Detector.clear(detect);
            Matter.Detector.setBodies(detect, save_detect);

            collisions_detect_update();
        }
    }
}

var b_ground = Bodies.rectangle(WIDTH/2, HEIGHT+5, WIDTH, 10, { isStatic: true, render: { visible: false, strokeStyle: "black", lineWidth: 1 } });
var l_ground = Bodies.rectangle(-5, HEIGHT/2, 10, HEIGHT, { isStatic: true, render: { visible: false, strokeStyle: "black", lineWidth: 1 } });
var r_ground = Bodies.rectangle(WIDTH+5, HEIGHT/2, 10, HEIGHT, { isStatic: true, render: { visible: false, strokeStyle: "black", lineWidth: 1 } });
// create a rectangle for the limit line (=> isSensor to true)
var limit_line = Bodies.rectangle(WIDTH/2, 60, WIDTH + 10, 2, { isStatic: true, isSensor: true, render: { strokeStyle: "#ffffff" } })

var categorie_a = 0x0002
var a_circle = Bodies.circle(WIDTH/2, 30, type_now.width, { isSensor: true, isStatic: true, render: { fillStyle: type_now.color }, collisionFilter: { categorie: categorie_a } } );

Composite.add(engine.world, [b_ground, l_ground, r_ground, a_circle, limit_line]);

var isHere = true;
var a = true;

Matter.Events.on(engine, "afterUpdate", () => {
    collisions_detect_update();
    // verify if the fruits go out of the limit line (=> y)
    for (let i = 0; i < fruits.length; i++) {
        if (isHere && fruits[i].body.position.y < 60) {
            alert("Game Over");
            location.reload();
        }
    }
});

render.canvas.addEventListener("mousemove", (e) => {
    if (e.offsetX <= WIDTH - type_now.width && e.offsetX >= type_now.width) {
        mouseX = e.offsetX;
        Matter.Body.setPosition(a_circle, {x: mouseX, y: 30});
    }
});

render.canvas.addEventListener("click", function () {
    if (isHere) {
        fruits.push(Object.create(fruit));
        fruits[fruits.length-1].start(type_now);

        a_circle.render.visible = false;
        isHere = false;
        setTimeout(() => {
            type_now = types[Math.floor(Math.random() * 4)];
            a_circle.render.fillStyle = type_now.color;
            a_circle.circleRadius = type_now.width;
            a_circle.render.visible = true;
            isHere = true;
        }, 500);
    }
});

Render.run(render);

var runner = Runner.create();

Runner.run(runner, engine);
