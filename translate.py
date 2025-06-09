# List of classes that model predicts
CLASSES = ['avocado', 'beans', 'beet', 
           'bell pepper', 'broccoli', 'brus capusta', 
           'cabbage', 'carrot', 'cayliflower', 
           'celery', 'corn', 'cucumber', 
           'eggplant', 'fasol', 'garlic', 
           'hot pepper', 'onion', 'peas', 
           'potato', 'pumpkin', 'rediska', 
           'redka', 'salad', 'squash-patisson', 
           'tomato', 'vegetable marrow', "apple", 
           "banana", "bread", 'cheese', 
           'egg', 'grape', 'lemon', 
           'mango', 'orange', 'peach', 
           'pear', 'strawberry', 'watermelon',
           'beef', 'chicken', 'pork']

# List of correspondences between the model class and the ingredient from the database
TRANSLATIONS = [
    ("avocado", "авокадо"), ("beans", ""),
    ("beet", "свекла"), ("bell pepper", "перец болгарский красный"),
    ("broccoli", "Брокколи"), ("brus capusta", ""),
    ("cabbage", "капуста"), ("carrot", "морковь"),
    ("cayliflower", ""), ("celery", "сельдерей"),
    ("corn", "кукуруза консервированная"),
    ("cucumber", "огурцы"), ("eggplant", ""), 
    ("fasol", ""), ("garlic", "чеснок"),
    ("hot pepper", "перец красный острый молотый"),
    ("onion", ("лук репчатый", "лук репчатый сладкий")), 
    ("peas", ("горох", "зеленый горошек")),
    ("potato", "картофель"), ("pumpkin", ""),
    ("rediska", ""), ("redka", ""), ("salad", "Салат Рамен"),
    ("squash-patisson", ""), ("tomato", ("помидоры", "Помидоры Черри")),
    ("vegetable marrow", "Кабачок"), ("apple", "яблоко"),
    ("banana", "Бананы"), ("bread", ("хлеб", "ржаной хлеб", "Белый хлеб")),
    ("cheese", ("сыр твердый", "сыр пармезан", "сыр")),
    ("egg", ("яйца", "желтки")), ("grape", ""),
    ("lemon", ("лимон", "лимонный сок")), ("mango", ""),
    ("orange", "апельсин"), ("peach", ""), ("pear", ""),
    ("strawberry", "клубника"), ("watermelon", ""),
    ("beef", "говядина"), ("chicken", ("курица", "куриный окорок")), 
    ("pork", ("свинина", "свиная шея"))
]

def translation(preds):
    '''
    Function that translates model predictions to ingredients from DB
    '''
    trans_dict = dict(TRANSLATIONS)
    res = []
    for pred in preds:
        val = trans_dict[pred]
        if val == "":
            continue
        if type(val) == str:
            res.append(val)
        elif type(val) == tuple:
            for v in val:
                res.append(v)
        else:
            raise ValueError(f"Incorrect type of traslation for {pred}!!!")
    return res
