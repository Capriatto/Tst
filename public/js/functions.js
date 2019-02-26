var socket = io();

    function fecha(data){
        var dt = new Date(data), today = new Date();

        var res = " ";
        if(dt.setHours(0,0,0,0) == today.setHours(0,0,0,0)){
            moment.lang('es', {
                relativeTime : {
                    future: "En %s",
                    past:   "Hace %s",
                    s:  "un momento",
                    m:  "un minuto",
                    mm: "%d minutos",
                    h:  "una hora",
                    hh: "%d horas",
                    d:  "un día",
                    dd: "%d días",
                    M:  "un mes",
                    MM: "%d meses",
                    y:  "un año",
                    yy: "%d años"
                }
            });
            res += moment(data).fromNow();

        } else {

            var primeraM = function(string){
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            var options = { weekday: "long", year: "numeric", month: "short",
            day: "numeric", hour:'2-digit', minute: '2-digit', hour12: 'true' };

            date = new Date(data);

            res += primeraM(date.toLocaleDateString("es-CO", options));
        }
        return res;
    }

    function like(id){

        if($('#dislike-'+id).attr('class') == 'fa fa-thumbs-down onDislike'){

            $('#dislike-'+id).attr('class', 'fa fa-thumbs-down dislike');
            $('#like-'+id).attr('class', 'fa fa-thumbs-up onLike');
            socket.emit('undislike', id);
            socket.emit('like', id);

        }

        else if($('#like-'+id).attr('class') == 'fa fa-thumbs-up like'){
            $('#like-'+id).attr('class', 'fa fa-thumbs-up onLike')
            socket.emit('like', id);
        }

        else if($('#like-'+id).attr('class') == 'fa fa-thumbs-up onLike'){
            $('#like-'+id).attr('class', 'fa fa-thumbs-up like')
            socket.emit('unlike', id);
        }
        document.activeElement.blur();
    }
    function dislike(id){

        if($('#like-'+id).attr('class') == 'fa fa-thumbs-up onLike'){
            $('#like-'+id).attr('class', 'fa fa-thumbs-up like');
            $('#dislike-'+id).attr('class', 'fa fa-thumbs-down onDislike');
            socket.emit('unlike', id);
            socket.emit('dislike', id);
        }

        else if($('#dislike-'+id).attr('class') == 'fa fa-thumbs-down dislike'){
            $('#dislike-'+id).attr('class', 'fa fa-thumbs-down onDislike');
            socket.emit('dislike', id);
        }

        else if($('#dislike-'+id).attr('class') == 'fa fa-thumbs-down onDislike'){
            $('#dislike-'+id).attr('class', 'fa fa-thumbs-down dislike')
            socket.emit('undislike', id);
        }
         document.activeElement.blur();
    }

    $(document).ready(function(){

        $("#twitter").keypress(function(e){
            var keyCode = e.which;
            
            if (keyCode == 64  || keyCode == 32 ) { 
              return false;
            }
        });

        $('#form').submit(function(){
            date = new Date();

            socket.emit('message', $('#twitter').val(), $('#mssge').val(), $('#pregunta').is(':checked'), date);
            $('#mssge').val('');
              
            return false;
        });

        socket.on('update', function(record){

            $('#dislike-numbers-'+record.id).text(''+record.dislikes+'');
            $('#like-numbers-'+record.id).text(''+record.likes+'');
        })


        
        var message = function(data){
            if (data.pregunta) {
               $('#chatBody').append(
                $('<li>')
                .attr('style','background: #ffebcc; border-radius: .5em')
                .addClass('list-group-item wrapword')

                .append(
                    $('<div>')
                    .addClass('row')

                    .append(
                        $('<div>')
                        .addClass('col-md-11 wrap')

                        .append(
                            $('<strong>')
                            .addClass('list-group-item-heading')
                            .append(
                                $('<a>')
                                .attr('href', 'http://twitter.com/'+data.twitter)
                                .attr('target','_blank')
                                .text('@' + data.twitter)
                            )

                        )
                        .append(
                            $('<p>')
                            .addClass('list-group-item-text')
                            .text(data.mssge)
                        )
                    )
                    .append(

                        $('<div>')
                        .addClass('col-md-1 row')

                        .append(
                            $('<div>')
                            .addClass('col-md-6')
                            .append(
                                $('<a>')
                                .addClass('fa fa-thumbs-down dislike')
                                .attr('id','dislike-'+data.id)
                                .attr('href','#')
                                .attr('onclick','dislike('+data.id+')')
                            )
                            .append(
                                $('<h6>')
                                .attr('id', 'dislike-numbers-'+data.id)
                                .text(data.dislikes)
                            )
                        )

                        .append(
                            $('<div>')
                            .addClass('col-md-6')
                            .append(
                                $('<a>')
                                .addClass('fa fa-thumbs-up like')
                                .attr('id','like-' + data.id)
                                .attr('href','#')
                                .attr('onclick','like('+data.id+')')
                            )
                            .append(
                                $('<h6>')
                                .attr('id','like-numbers-'+data.id)
                                .text(data.likes)
                            )
                        )
                    )
                    .append(  data.date != null ?
                        $('<div>')
                        .addClass('col-md-12')
                        .append(
                            $('<i>')
                            .addClass('fa fa-clock-o')
                        )
                        .append(
                            $('<small>')
                            .text(fecha(data.date))
                        ) :
                        $('<div>')
                    )
                )
            );
            }else{
                $('#chatBody').append(
                $('<li>')
                //.attr('style','background: #ffebcc; border-radius: .5em')
                .addClass('list-group-item wrapword')

                .append(
                    $('<div>')
                    .addClass('row')

                    .append(
                        $('<div>')
                        .addClass('col-md-11 wrap')

                        .append(
                            $('<strong>')
                            .addClass('list-group-item-heading')
                            .append(
                                $('<a>')
                                .attr('href', 'http://twitter.com/'+data.twitter)
                                .attr('target','_blank')
                                .text('@' + data.twitter)
                            )

                        )
                        .append(
                            $('<p>')
                            .addClass('list-group-item-text')
                            .text(data.mssge)
                        )
                    )
                    .append(

                        $('<div>')
                        .addClass('col-md-1 row')

                        .append(
                            $('<div>')
                            .addClass('col-md-6')
                            .append(
                                $('<a>')
                                .addClass('fa fa-thumbs-down dislike')
                                .attr('id','dislike-'+data.id)
                                .attr('href','#')
                                .attr('onclick','dislike('+data.id+')')
                            )
                            .append(
                                $('<h6>')
                                .attr('id', 'dislike-numbers-'+data.id)
                                .text(data.dislikes)
                            )
                        )

                        .append(
                            $('<div>')
                            .addClass('col-md-6')
                            .append(
                                $('<a>')
                                .addClass('fa fa-thumbs-up like')
                                .attr('id','like-' + data.id)
                                .attr('href','#')
                                .attr('onclick','like('+data.id+')')
                            )
                            .append(
                                $('<h6>')
                                .attr('id','like-numbers-'+data.id)
                                .text(data.likes)
                            )
                        )
                    )
                    .append(  data.date != null ?
                        $('<div>')
                        .addClass('col-md-12')
                        .append(
                            $('<i>')
                            .addClass('fa fa-clock-o')
                        )
                        .append(
                            $('<small>')
                            .text(fecha(data.date))
                        ) :
                        $('<div>')
                    )
                )
            );
            }
            
        };

        socket.on('init', function(data){
            console.log(data);
            for(msg in data){
                var msg = data[msg];
                message(msg);
            }
            $("#chatBody").scrollTop($('#chatBody')[0].scrollHeight);
        });

        socket.on('message', function(data){
            message(data);
            $("#chatBody").animate({
                scrollTop: $('#chatBody')[0].scrollHeight
            }, 1000);
        });
    });
