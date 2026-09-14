const makeSlide = (title, points) => ({
    type: 'content',
    title,
    points,
    takeaway: 'A concise takeaway for this slide.'
});

module.exports = {
    comparison: {
        slides: [makeSlide('Manual Ordering vs QR Ordering', [
            'Manual ordering: Staff record requests and relay them to the kitchen.',
            'QR ordering: Guests submit orders directly from their own devices.'
        ])]
    },
    process: {
        slides: [makeSlide('How the QR Ordering Process Works', [
            'Scan the table QR code.',
            'Browse the digital menu.',
            'Submit the selected items.',
            'Receive the prepared order.'
        ])]
    },
    architecture: {
        slides: [makeSlide('QR Ordering System Architecture', [
            'Guest interface: Lets diners browse and submit orders.',
            'Order service: Validates requests and manages order status.',
            'Kitchen dashboard: Displays confirmed orders for preparation.'
        ])]
    },
    roadmap: {
        slides: [makeSlide('Implementation Roadmap', [
            'Phase one: Design the ordering experience.',
            'Phase two: Build the ordering workflow.',
            'Phase three: Test with restaurant staff.'
        ])]
    },
    cardGrid: {
        slides: [makeSlide('Core Platform Benefits', [
            'Faster service: Guests order without waiting for staff.',
            'Fewer mistakes: Orders move directly to the kitchen.',
            'Live updates: Menu availability stays current.'
        ])]
    },
    ambiguous: {
        slides: [makeSlide('Why Digital Ordering Matters', [
            'Restaurants need a clearer way to manage busy periods.',
            'Guests expect convenient service when they dine out.',
            'A digital system can support staff during peak hours.'
        ])]
    },
    universityLife: {
        slides: [
            makeSlide('Introduction to University Life', [
                'University creates new academic and social opportunities.',
                'Students learn to manage independence and responsibility.',
                'Campus life builds skills beyond the classroom.'
            ]),
            makeSlide('Campus Facilities', [
                'Libraries provide study spaces and academic resources.',
                'Sports centres support health and student wellbeing.',
                'Technology labs give access to practical tools.'
            ]),
            makeSlide('Academic Courses', [
                'Core modules establish subject knowledge.',
                'Elective courses let students explore interests.',
                'Projects connect learning with practical work.'
            ]),
            makeSlide('Social Life on Campus', [
                'Student clubs connect people with shared interests.',
                'Events create friendships across different courses.',
                'Volunteer work builds confidence and community.'
            ]),
            makeSlide('Common Student Challenges', [
                'Time management becomes important during busy weeks.',
                'Financial planning helps students manage expenses.',
                'Support services can help with stress and wellbeing.'
            ]),
            makeSlide('Future Opportunities', [
                'Internships offer practical workplace experience.',
                'Career services help students plan next steps.',
                'Networks can create long-term professional connections.'
            ])
        ]
    }
};
