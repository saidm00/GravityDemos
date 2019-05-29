var sketch = function(p) {
    const G = 6.67408 * 10e-11;
    const N = 150;
    const FPS = 60;
    const R = 3;
    const boxSize = new p5.Vector(90, 90, 90);

    class Particle {
        constructor(pos, r) {
            this.pos = pos;
            this.radius = r;
            this.vel = new p5.Vector(0, 0, 0);
            this.acc = new p5.Vector(0, 0, 0);

            this.mass = this.getMass();
        }

        getMass() {
            const M = 4e10;
            let V = 4/3 * Math.PI * Math.pow(this.radius,3);
            return V * M;
        }

        addForce(force) {
            this.acc.add(force);
        }

        update(dt) {
            this.vel.add(p5.Vector.mult(p5.Vector.div(this.acc, this.mass), dt));
            this.pos.add(p5.Vector.mult(this.vel, dt));
            this.acc.mult(0);
        }

        draw() {
            let m1 = this.vel.mag() / 100;
            let m2 = 1 - m1;
            p.ambientMaterial(m1 * 255, p.lerp(170, 200, m2), m2 * 200);
            p.push();
            p.noStroke();
            p.translate(this.pos.x, this.pos.y, this.pos.z);
            p.sphere(this.radius);
            p.pop();
        }

        collided(other) {
            var r1 = this.radius;
            var r2 = other.radius;

            var r = p5.Vector.dist(other.pos, this.pos);

            return r <= r1+r2;
        }
    }

    function reflect(I, N) {
        return I.sub( p5.Vector.mult(N,2*p5.Vector.dot(N, I)) );
    }

    p.setup = function() {
        p.createCanvas(360, 360, p.WEBGL);
        p.frameRate(FPS);
        p.debugTex = p.loadImage('./images/debug_gridlow1.png');

        p.particles = new Array(N);
        for(var i = 0; i < N; i++) {
            var pos = new p5.Vector(p.random(-boxSize.x, boxSize.x),
                p.random(-boxSize.y, boxSize.y),
                p.random(-boxSize.z, boxSize.z));
            p.particles[i] = new Particle(pos, R);
        }
    };

    p.draw = function() {
        p.background(0);
        p.orbitControl();

        var deltaTime = 1 / FPS;

        var nom = new p5.Vector(0,0,0);
        var denom = 0;

        // Physics step
        for(var i = 0; i < N; i++) {
            var a = p.particles[i];
            for(var j = 0; j < N; j++) {
                if(i != j) {
                    var b = p.particles[j];
                    var p1 = a.pos.copy();
                    var p2 = b.pos.copy();

                    var u = p5.Vector.sub(p1, p2).normalize();

                    var m1 = a.mass;
                    var m2 = b.mass;

                    var r = p5.Vector.dist(p2, p1);

                    var F = p5.Vector.mult(u, G * (m1*m2) / (r*r));
                    b.addForce(F);
                }
            }

            nom.add(p5.Vector.mult(a.pos, a.mass));
            denom += a.mass;
        }

        p.directionalLight(255, 255, 255, 0, 0, -1);
        //p.texture(p.debugTex);

        for(var i = 0; i < N; i++) {
            var a = p.particles[i];
            for(var j = 0; j < N; j++) {
                var b = p.particles[j];
                if(i != j && a.collided(b)) {
                    var p1 = a.pos.copy();
                    var p2 = b.pos.copy();

                    var n = p5.Vector.sub(p1, p2).normalize();

                    var m1 = a.mass;
                    var m2 = b.mass;

                    var v1 = a.vel;
                    var v2 = b.vel;

                    var r1 = p5.Vector.mult(n, a.radius);
                    var r2 = p5.Vector.mult(n, -b.radius);

                    var vr = p5.Vector.sub(v1, v2);

                    var e = 0.0;

                    var jr_nom = (1-e)*p5.Vector.dot(vr,n);
                    var jr_denom = Math.pow(m1,-1) + Math.pow(m2,-1)
                        //+ p5.Vector.dot(p5.Vector.add(p5.Vector.cross(p5.Vector.cross(r1,n),r1),
                        //                              p5.Vector.cross(p5.Vector.cross(r2,n),r2)),n)

                    ;

                    var jr = jr_nom/jr_denom;

                    a.vel = p5.Vector.sub(v1, p5.Vector.mult(n,jr/m1));
                    b.vel = p5.Vector.add(v2, p5.Vector.mult(n,jr/m2));
                    a.acc.mult(0);
                    b.acc.mult(0);
                }
            }
            a.update(deltaTime);
            a.draw();
        }

        p.fill(255);
        p.strokeWeight(1.25);
        p.stroke(128);

        // front
        p.line(-boxSize.x, -boxSize.y, boxSize.z, boxSize.x, -boxSize.y, boxSize.z);
        p.line(-boxSize.x, boxSize.y, boxSize.z, boxSize.x, boxSize.y, boxSize.z);
        p.line(-boxSize.x, -boxSize.y, boxSize.z, -boxSize.x, boxSize.y, boxSize.z);
        p.line(boxSize.x, -boxSize.y, boxSize.z, boxSize.x, boxSize.y, boxSize.z);

        // back
        p.line(-boxSize.x, -boxSize.y, -boxSize.z, boxSize.x, -boxSize.y, -boxSize.z);
        p.line(-boxSize.x, boxSize.y, -boxSize.z, boxSize.x, boxSize.y, -boxSize.z);
        p.line(-boxSize.x, -boxSize.y, -boxSize.z, -boxSize.x, boxSize.y, -boxSize.z);
        p.line(boxSize.x, -boxSize.y, -boxSize.z, boxSize.x, boxSize.y, -boxSize.z);

        // left top
        p.line(-boxSize.x, -boxSize.y, boxSize.z, -boxSize.x, -boxSize.y, -boxSize.z);
        // left bottom
        p.line(-boxSize.x, boxSize.y, -boxSize.z, -boxSize.x, boxSize.y, boxSize.z);
        // right top
        p.line(boxSize.x, -boxSize.y, boxSize.z, boxSize.x, -boxSize.y, -boxSize.z);
        // right bottom
        p.line(boxSize.x, boxSize.y, -boxSize.z, boxSize.x, boxSize.y, boxSize.z);

        p.strokeWeight(2);

        // Draw center of mass
        p.stroke(255, 128, 255);

        nom.div(denom);
        p.point(nom.x, nom.y, nom.z);
    };
};