window.onload = () => {

    const burst = new mojs.Burst({
        left: 0, top: 0,
        count:          8,
        radius:         { 50: 150 },
        children: {
            shape:        'line',
            stroke:       [ 'white', '#FFE217', '#FC46AD', '#D0D202', '#B8E986', '#D0D202' ],
            scale:        1,
            scaleX:       { 1 : 0 },
            // pathScale:    'rand(.5, 1.25)',
            degreeShift:  'rand(-90, 90)',
            radius:       'rand(20, 40)',
            // duration:     200,
            delay:        'rand(0, 150)',
            isForce3d:    true
        }
    });
    
    const CIRCLE_OPTS = {
        left: 0, top: 0,
        scale:      { 0: 1 },
    }
    const circle = new mojs.Shape({
        ...CIRCLE_OPTS,
        fill:       '#9B9B9B',
        opacity:    { .5 : 0 },
        radius:     30,
    });

    document.addEventListener( 'click', function(e) {
    
    burst
        .tune({ x: e.pageX, y: e.pageY })
        .generate()
        .replay();
    
    circle
        .tune({ x: e.pageX, y: e.pageY })
        .replay();
    });
}