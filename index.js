const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();


exports.userDeleted = functions.auth.user().onDelete(user => {
    const doc = admin.firestore().collection('users').doc(user.uid);
    return doc.delete();
});

// like functionality-- TODO: add different displays to like buttons if they're liked or not

exports.like = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'only authenticated users can like'
        );
    }
    console.log('got here 1')
    const user = admin.firestore().collection('users').doc(context.auth.uid);
    const post = admin.firestore().collection('posts').doc(data.id);

    return user.get().then(doc => {
        // check user hasn't already liked a post
        if(doc.data().likedPosts.includes(data.id)) {
            // remove that id from users liked posts
            const likedpostsArray = doc.data().likedPosts;
            const index = doc.data().likedPosts.findIndex(id => id === data.id);
            likedpostsArray.splice(index, 1);
            return user.update({
                likedPosts: likedpostsArray
            }).then(() => {
                return post.update({
                    likes: admin.firestore.FieldValue.increment(-1)
                });
            });
        }
        else {

            return user.update({
                likedPosts: [...doc.data().likedPosts, data.id]
            }).then(() => {

                return post.update({
                    likes: admin.firestore.FieldValue.increment(1)
                });
            });
        }

    });
});
// comment function // TO DO EDIT

exports.comment = functions.https.onCall((data, context) => {

    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'only authenticated users can comment'
        );
    }

    else {
        const user = admin.firestore().collection('users').doc(context.auth.uid);
        const post = admin.firestore().collection('posts').doc(data.id);

        return post.get().then(doc => {
            if(doc.data().comments.length <= 0) {
                const commentedOnDoc = user.collection('commentedOn').doc(data.id);
                post.update({
                    comments: admin.firestore.FieldValue.arrayUnion(data.comment)
                });
                return commentedOnDoc.set({
                    comments: [data.comment]
                });
            }
            else {
                post.update({
                    comments: admin.firestore.FieldValue.arrayUnion(data.comment)
                });
                const commentedOnDoc = user.collection('commentedOn').doc(data. id);
                commentedOnDoc.get().then((docSnapshot) => {
                    if (docSnapshot.exists) {
                        return commentedOnDoc.update({
                            comments: admin.firestore.FieldValue.arrayUnion(data.comment)
                        });
                      } else {
                        return commentedOnDoc.set({
                            comments: [data.comment]
                        });
                      }
                    });

            }
        });
    }

});

exports.fetchInstrument = functions.https.onCall((data,context) => {

});
