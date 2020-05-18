var room_name = ''

function generate_room_name(){
    var num = Math.floor(Math.random()*90000) + 100000;
    var str = num.toString(16).toUpperCase();
    room_name = str;
    return room_name;
}

module.exports.generate = generate_room_name();

function get_room_name(){
    if (room_name == '')
        generate_room_name();
    return room_name;
}

module.exports.get = get_room_name();
