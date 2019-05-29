var sketch = function(p) {
    const G = 6.67408 * 10e-11;
    const N = 200;
    const FPS = 60;

    class Particle {
        constructor(pos, r, mass) {
            this.pos = pos;
            this.radius = r;
            this.vel = new p5.Vector(0, 0);
            this.acc = new p5.Vector(0, 0);

            this.mass = mass;
        }

        addForce(force) {
            this.acc.add(force);
        }

        update(dt) {
            this.vel.add(p5.Vector.mult(p5.Vector.div(this.acc, this.mass), dt));
            this.pos.add(p5.Vector.mult(this.vel, dt));
            this.acc = new p5.Vector(0,0);
        }

        draw() {
            let m1 = this.vel.mag() / 100;
            let m2 = 1 - m1;
            p.fill(m1 * 255, p.lerp(170, 200, m2), m2 * 200);
            p.noStroke();
            let r2 = this.radius * 2;
            p.ellipse(this.pos.x, this.pos.y, r2, r2);
        }
    }

    p.setup = function() {
        p.createCanvas(360, 360);
        p.frameRate(FPS);

        var center = new p5.Vector(p.width/2, p.height/2);
        var box = new p5.Vector(p.width/2, p.height/2);

        p.particles = new Array(N);
        for(var i = 0; i < N; i++) {
            p.particles[i] = new Particle(new p5.Vector(
                p.random(center.x - box.x, center.x + box.x),
                p.random(center.y - box.y, center.y + box.y)),
                p.random(0.25, 1),
                p.random(1e13, 3e13));
        }

        p.center = center;
        p.box = box;

        // Timing properties
        p.time = p.millis();
    };

    p.draw = function() {
        p.background('rgba(0,0,0,0.5)');

        // Calculate delta time
        p.lastTime = p.time;
        p.time = p.millis();
        //var deltaTime = (p.time - p.lastTime) / 1000;
        var deltaTime = 1/FPS;

        for(var i = 0; i < p.particles.length; i++) {
            var a = p.particles[i];

            for(var j = p.particles.length-1; j >= 0; j--) {
                if (i == j) continue;
                var b = p.particles[j];
                var distance = p5.Vector.sub(b.pos, a.pos).mag();
                if (distance > a.radius + b.radius) continue;
                var total_mass = a.mass + b.mass;
                {var apm = p5.Vector.mult(a.pos, a.mass);
                    var bpm = p5.Vector.mult(b.pos, b.mass);
                    var avg_pos = p5.Vector.add(apm, bpm);
                    var new_pos = p5.Vector.div(avg_pos, total_mass);
                    a.pos = new_pos.copy();}
                {var avm = p5.Vector.mult(a.vel, a.mass);
                    var bvm = p5.Vector.mult(b.vel, b.mass);
                    var avg_vel = p5.Vector.add(avm, bvm);
                    var new_vel = p5.Vector.div(avg_vel, total_mass);
                    a.vel = new_vel.copy();}
                a.mass = total_mass;
                a.radius = Math.sqrt(a.radius * a.radius + b.radius * b.radius);
                p.particles.splice(j, 1);
            }
        }

        var nom = new p5.Vector(0,0);
        var denom = 0;

        for(var i = 0; i < p.particles.length; i++) {
            var a = p.particles[i];

            for(var j = 0; j < p.particles.length; j++) {
                if(i != j) {
                    var b = p.particles[j];

                    var p1 = a.pos.copy();
                    var p2 = b.pos.copy();

                    var u = p5.Vector.sub(p2, p1).normalize();

                    var m1 = a.mass;
                    var m2 = b.mass;

                    var r = p5.Vector.dist(p2, p1);

                    var F = p5.Vector.mult(u, G * (m1*m2) / (r*r));

                    a.addForce(F);
                }
            }

            nom.add(p5.Vector.mult(a.pos, a.mass));
            denom += a.mass;
        }

        for(var i = 0; i < p.particles.length; i++) {
            var a = p.particles[i];
            if (a.pos.x < 0 || a.pos.y < 0 ||
                a.pos.x > p.width || a.pos.y > p.height) {
                p.particles.splice(i, 1);
                i -= 1;
            }
        }

        for(var i = 0; i < p.particles.length; i++) {
            var a = p.particles[i];
            a.update(deltaTime);
            a.draw();
        }
        /*
         p.stroke(255, 128, 255);
         p.strokeWeight(1);
         p.noFill();
         p.rect(p.center.x - p.box.x, p.center.y - p.box.y,
                p.box.x*2, 2*p.box.y);

         p.strokeWeight(5);

         nom.div(denom);
         p.point(nom.x, nom.y);
        */

    };
};