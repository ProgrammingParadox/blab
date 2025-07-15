
enum LabelFields {
    bug = 'bug',
    collector = 'collector',
    date = 'date',
    location = 'location',
}
type LabelInfo = {
    [key in LabelFields]?: string;
}

class LabelFormat {
    constructor(labelEntries: LabelFields[]) {}
}

class Label {
    private info: LabelInfo;
    constructor(info: LabelInfo) {
        this.info = info;
    }
}

/*

let temp = new Label({
    info: [
        { bug      : "moth blah blah blah" },
        { collector: "some kid"            },
        { date     : "7/14/2025"           },
        { location : "under rock, CA"      },
    ],

    styleset
});

 */

