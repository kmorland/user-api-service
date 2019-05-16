export class User {

    gender: String = null;
    email: string = null;
    name: Name = null;
    dob: Dob = null;
    phone: String = null;
    cell: String = null;
    nat: String = null;
    location: Location = null;
    picture: Picture = null;
    creationDate: String = null;
    updatedDate: String = null;

    constructor(values:any) {
        Object.assign(this, values);
        if(values.name) this.name = new Name(values.name);
        if(values.dob) this.dob = new Dob(values.dob);
        if(values.location) this.location = new Location(values.location);
        if(values.picture) this.picture = new Picture(values.picture);
    }
}

class Name {
    title: String = null;
    first: String = null;
    last: String = null;
    
    constructor(values:any) {
        Object.assign(this, values);
    }
}

class Dob {
    date: String = null;
    age: String = null;

    constructor(values:any) {
        Object.assign(this, values);
    }
}

class Location {
    street: String = null;
    city: String = null;
    state: String = null;
    postcode: String = null;
    coordinates: Coordinates = null;

    constructor(values:any) {
        Object.assign(this, values);
        if(values.coordinates) this.coordinates = new Coordinates(values.coordinates);
    }
}

class Coordinates {
    latitude: String = null;
    longitude: String = null;

    constructor(values:any) {
        Object.assign(this, values);
    }
}

class Picture {
    large: String = null;
    thumbnail: String = null;
    medium: String = null;

    constructor(values:any) {
        Object.assign(this, values);
    }
}